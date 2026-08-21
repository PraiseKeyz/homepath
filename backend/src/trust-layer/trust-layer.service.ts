import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiExplanationService } from './ai-explanation.service.js';
import { SubmitDocumentDto } from './dto/submit-document.dto.js';
import { SubmitReportDto } from './dto/submit-report.dto.js';
import { VerifyRegistryDto } from './dto/verify-registry.dto.js';
import {
  CommunityReportType,
  NotificationType,
  RegistryStatus,
} from '../../generated/prisma/index.js';
import { NotificationsService } from '../notifications/notifications.service.js';

// The Trust Score formula from docs/ARCHITECTURE.md §2.1. It is a deterministic
// composite of two independently-checkable signals — registry match and
// community reports. AI is not part of this computation; it only narrates the
// result afterwards (see AiExplanationService).
const REGISTRY_BASE_SCORE = {
  CLEAN: 85,
  FLAGGED: 15,
  DISPUTED: 15,
  NOT_FOUND: 50,
} as const;
const CONFIRMATION_WEIGHT = 3;
const CONFIRMATION_CAP = 10;
const DISPUTE_WEIGHT = 8;
const DISPUTE_CAP = 40;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

@Injectable()
export class TrustLayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiExplanationService: AiExplanationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async submitDocument(
    propertyId: string,
    submittedById: string,
    dto: SubmitDocumentDto,
  ) {
    await this.assertPropertyExists(propertyId);
    return this.prisma.propertyDocument.upsert({
      where: { propertyId },
      create: { propertyId, submittedById, ...dto },
      update: { ...dto },
    });
  }

  async submitReport(
    propertyId: string,
    reporterId: string,
    dto: SubmitReportDto,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');

    const report = await this.prisma.communityReport.create({
      data: {
        propertyId,
        reporterId,
        type: dto.type,
        description: dto.description,
      },
    });

    await this.notificationsService.create(
      property.ownerId,
      NotificationType.COMMUNITY_REPORT_FILED,
      'New community report on your listing',
      `A ${dto.type.toLowerCase().replace('_', ' ')} report was filed on "${property.title}".`,
    );

    return report;
  }

  async computeTrustScore(propertyId: string) {
    const document = await this.prisma.propertyDocument.findUnique({
      where: { propertyId },
    });
    if (!document) {
      throw new NotFoundException(
        'No self-attested document submitted for this property yet — submit one before requesting a Trust Score.',
      );
    }

    const registryStatus = await this.lookupRegistryStatus(
      document.plotNumber,
      document.surveyNumber,
    );

    const reports = await this.prisma.communityReport.findMany({
      where: { propertyId },
    });
    const { score, communityAdjustment, explanationText } =
      await this.scoreAndExplain(registryStatus, reports);

    return this.prisma.trustScore.upsert({
      where: { propertyId },
      create: {
        propertyId,
        score,
        registryStatus,
        communityAdjustment,
        explanationText,
      },
      update: {
        score,
        registryStatus,
        communityAdjustment,
        explanationText,
        computedAt: new Date(),
      },
    });
  }

  // Standalone registry check — no listing required. Reuses the exact same
  // formula as computeTrustScore(); only the sourcing of the two signals
  // differs (a raw plot/survey pair instead of a property's own document).
  // See docs/ARCHITECTURE.md §2.1.
  async verifyByRegistry(dto: VerifyRegistryDto) {
    const registryStatus = await this.lookupRegistryStatus(
      dto.plotNumber,
      dto.surveyNumber,
    );

    const matchedDocuments = await this.prisma.propertyDocument.findMany({
      where: { plotNumber: dto.plotNumber, surveyNumber: dto.surveyNumber },
      include: {
        property: { select: { id: true, title: true, address: true } },
      },
    });
    const matchedPropertyIds = matchedDocuments.map((d) => d.propertyId);

    const reports = matchedPropertyIds.length
      ? await this.prisma.communityReport.findMany({
          where: { propertyId: { in: matchedPropertyIds } },
        })
      : [];

    const { score, communityAdjustment, explanationText } =
      await this.scoreAndExplain(registryStatus, reports);

    return {
      plotNumber: dto.plotNumber,
      surveyNumber: dto.surveyNumber,
      score,
      registryStatus,
      communityAdjustment,
      explanationText,
      matchedProperties: matchedDocuments.map((d) => d.property),
    };
  }

  private async lookupRegistryStatus(
    plotNumber: string,
    surveyNumber: string,
  ): Promise<RegistryStatus | 'NOT_FOUND'> {
    const registryRecord = await this.prisma.registryRecord.findUnique({
      where: { plotNumber_surveyNumber: { plotNumber, surveyNumber } },
    });
    return registryRecord?.status ?? 'NOT_FOUND';
  }

  private async scoreAndExplain(
    registryStatus: RegistryStatus | 'NOT_FOUND',
    reports: { type: CommunityReportType }[],
  ) {
    const confirmationCount = reports.filter(
      (r) => r.type === CommunityReportType.CONFIRMATION,
    ).length;
    const disputeCount = reports.filter(
      (r) =>
        r.type === CommunityReportType.DISPUTE ||
        r.type === CommunityReportType.FRAUD_FLAG,
    ).length;

    const base = REGISTRY_BASE_SCORE[registryStatus];
    const communityAdjustment =
      Math.min(CONFIRMATION_WEIGHT * confirmationCount, CONFIRMATION_CAP) -
      Math.min(DISPUTE_WEIGHT * disputeCount, DISPUTE_CAP);
    const score = clamp(base + communityAdjustment, 0, 100);

    const explanationText = await this.aiExplanationService.explain({
      score,
      registryStatus,
      confirmationCount,
      disputeCount,
    });

    return { score, communityAdjustment, explanationText };
  }

  private async assertPropertyExists(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');
  }
}

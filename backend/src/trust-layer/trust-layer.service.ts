import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiExplanationService } from './ai-explanation.service.js';
import { SubmitDocumentDto } from './dto/submit-document.dto.js';
import { SubmitReportDto } from './dto/submit-report.dto.js';
import { CommunityReportType } from '../../generated/prisma/index.js';

// The Trust Score formula from docs/ARCHITECTURE.md §2.1. It is a deterministic
// composite of two independently-checkable signals — registry match and
// community reports. AI is not part of this computation; it only narrates the
// result afterwards (see AiExplanationService).
const REGISTRY_BASE_SCORE = { CLEAN: 85, FLAGGED: 15, DISPUTED: 15, NOT_FOUND: 50 } as const;
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
  ) {}

  async submitDocument(propertyId: string, submittedById: string, dto: SubmitDocumentDto) {
    await this.assertPropertyExists(propertyId);
    return this.prisma.propertyDocument.upsert({
      where: { propertyId },
      create: { propertyId, submittedById, ...dto },
      update: { ...dto },
    });
  }

  async submitReport(propertyId: string, reporterId: string, dto: SubmitReportDto) {
    await this.assertPropertyExists(propertyId);
    return this.prisma.communityReport.create({
      data: { propertyId, reporterId, type: dto.type, description: dto.description },
    });
  }

  async computeTrustScore(propertyId: string) {
    const document = await this.prisma.propertyDocument.findUnique({ where: { propertyId } });
    if (!document) {
      throw new NotFoundException(
        'No self-attested document submitted for this property yet — submit one before requesting a Trust Score.',
      );
    }

    const registryRecord = await this.prisma.registryRecord.findUnique({
      where: {
        plotNumber_surveyNumber: {
          plotNumber: document.plotNumber,
          surveyNumber: document.surveyNumber,
        },
      },
    });
    const registryStatus = registryRecord?.status ?? 'NOT_FOUND';

    const reports = await this.prisma.communityReport.findMany({ where: { propertyId } });
    const confirmationCount = reports.filter((r) => r.type === CommunityReportType.CONFIRMATION).length;
    const disputeCount = reports.filter(
      (r) => r.type === CommunityReportType.DISPUTE || r.type === CommunityReportType.FRAUD_FLAG,
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

  private async assertPropertyExists(propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
  }
}

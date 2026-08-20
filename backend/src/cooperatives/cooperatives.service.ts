import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCooperativeDto } from './dto/create-cooperative.dto.js';
import { JoinCooperativeDto } from './dto/join-cooperative.dto.js';
import { ProposeRentToOwnMatchDto } from './dto/propose-match.dto.js';
import { RespondRentToOwnMatchDto } from './dto/respond-match.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../../generated/prisma/index.js';

@Injectable()
export class CooperativesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  create(dto: CreateCooperativeDto) {
    return this.prisma.cooperative.create({ data: dto });
  }

  findAll() {
    return this.prisma.cooperative.findMany({
      include: { _count: { select: { memberships: true } } },
    });
  }

  findMyMemberships(userId: string) {
    return this.prisma.cooperativeMembership.findMany({
      where: { userId },
      include: {
        cooperative: true,
        contributions: { orderBy: { month: 'asc' } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async join(cooperativeId: string, userId: string, dto: JoinCooperativeDto) {
    const cooperative = await this.prisma.cooperative.findUnique({
      where: { id: cooperativeId },
    });
    if (!cooperative) throw new NotFoundException('Cooperative not found');

    return this.prisma.cooperativeMembership.upsert({
      where: { cooperativeId_userId: { cooperativeId, userId } },
      create: {
        cooperativeId,
        userId,
        monthlyContributionAmount: dto.monthlyContributionAmount,
      },
      update: { monthlyContributionAmount: dto.monthlyContributionAmount },
    });
  }

  async demandClusters() {
    const cooperatives = await this.prisma.cooperative.findMany({
      include: {
        memberships: {
          select: { monthlyContributionAmount: true },
        },
      },
    });

    return cooperatives.map((cooperative) => ({
      cooperativeId: cooperative.id,
      name: cooperative.name,
      targetAreaKey: cooperative.targetAreaKey,
      targetPropertyType: cooperative.targetPropertyType,
      memberCount: cooperative.memberships.length,
      totalMonthlySavings: cooperative.memberships.reduce(
        (sum, m) => sum + Number(m.monthlyContributionAmount),
        0,
      ),
    }));
  }

  // RentToOwnMatch (docs/ARCHITECTURE.md §4/§6, journey step 6 "Own") — a
  // property's owner proposes a match to a cooperative; a member of that
  // cooperative accepts or declines it. Not a separate module per §3's
  // documented module list — RentToOwnMatch is a Cooperatives-domain flow.
  async proposeMatch(
    cooperativeId: string,
    requestingUserId: string,
    dto: ProposeRentToOwnMatchDto,
  ) {
    const cooperative = await this.prisma.cooperative.findUnique({
      where: { id: cooperativeId },
    });
    if (!cooperative) throw new NotFoundException('Cooperative not found');

    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.ownerId !== requestingUserId) {
      throw new ForbiddenException(
        'Only the property owner can propose a match for this property',
      );
    }

    return this.prisma.rentToOwnMatch.create({
      data: { cooperativeId, propertyId: dto.propertyId },
    });
  }

  async findMatches(cooperativeId: string) {
    return this.prisma.rentToOwnMatch.findMany({
      where: { cooperativeId },
      include: { property: true },
      orderBy: { matchedAt: 'desc' },
    });
  }

  async respondToMatch(
    matchId: string,
    requestingUserId: string,
    dto: RespondRentToOwnMatchDto,
  ) {
    const match = await this.prisma.rentToOwnMatch.findUnique({
      where: { id: matchId },
      include: { property: true, cooperative: true },
    });
    if (!match) throw new NotFoundException('Match not found');

    const membership = await this.prisma.cooperativeMembership.findUnique({
      where: {
        cooperativeId_userId: {
          cooperativeId: match.cooperativeId,
          userId: requestingUserId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException(
        'Only members of this cooperative can respond to a match',
      );
    }

    const updated = await this.prisma.rentToOwnMatch.update({
      where: { id: matchId },
      data: { status: dto.status },
    });

    await this.notificationsService.create(
      match.property.ownerId,
      dto.status === 'ACCEPTED'
        ? NotificationType.MATCH_ACCEPTED
        : NotificationType.MATCH_DECLINED,
      dto.status === 'ACCEPTED'
        ? 'Rent-to-own match accepted'
        : 'Rent-to-own match declined',
      `${match.cooperative.name} ${dto.status === 'ACCEPTED' ? 'accepted' : 'declined'} your match for "${match.property.title}".`,
    );

    return updated;
  }
}

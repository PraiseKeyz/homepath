import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCooperativeDto } from './dto/create-cooperative.dto.js';
import { JoinCooperativeDto } from './dto/join-cooperative.dto.js';

@Injectable()
export class CooperativesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCooperativeDto) {
    return this.prisma.cooperative.create({ data: dto });
  }

  findAll() {
    return this.prisma.cooperative.findMany({
      include: { _count: { select: { memberships: true } } },
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

  // BuildMatch (docs/ARCHITECTURE.md §4): demand clusters are not a stored
  // table, just an aggregate read over Contribution grouped by target area —
  // "in Mowe-Ofada, N cooperative members are saving ₦X/month toward a unit".
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
}

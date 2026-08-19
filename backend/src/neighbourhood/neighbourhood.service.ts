import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NeighbourhoodService {
  constructor(private readonly prisma: PrismaService) {}

  // floodRiskScore/powerScore/securityScore come from seeded demo data (see
  // docs/ARCHITECTURE.md §5). placesCache/commuteCache are meant to hold real
  // Google Places/Maps API responses — TODO: wire up those API calls and
  // populate the cache fields here.
  async findByAreaKey(areaKey: string) {
    const data = await this.prisma.neighbourhoodData.findUnique({ where: { areaKey } });
    if (!data) throw new NotFoundException('No neighbourhood data for this area yet');
    return data;
  }
}

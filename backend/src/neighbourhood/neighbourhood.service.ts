import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NeighbourhoodService {
  constructor(private readonly prisma: PrismaService) {}

  async findByAreaKey(areaKey: string) {
    const data = await this.prisma.neighbourhoodData.findUnique({
      where: { areaKey },
    });
    if (!data)
      throw new NotFoundException('No neighbourhood data for this area yet');
    return data;
  }
}

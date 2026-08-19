import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreatePropertyDto) {
    return this.prisma.property.create({ data: { ownerId, ...dto } });
  }

  // TODO: filter by price/type/bedrooms/Trust Score once the map view needs it
  // (see docs/ARCHITECTURE.md §5 — Property Search Map + Trust Heatmap).
  findAll() {
    return this.prisma.property.findMany({
      include: { trustScore: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { trustScore: true, document: true, communityReports: true },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SafeUserSelect } from '../common/constants/safe-user.constant.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SafeUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findLandlordProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SafeUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');

    const [totalListings, soldOrRented, available] = await Promise.all([
      this.prisma.property.count({ where: { ownerId: id } }),
      this.prisma.property.count({
        where: { ownerId: id, status: { in: ['MATCHED', 'UNAVAILABLE'] } },
      }),
      this.prisma.property.count({
        where: { ownerId: id, status: 'AVAILABLE' },
      }),
    ]);

    return {
      ...user,
      totalListings,
      propertiesSoldOrRented: soldOrRented,
      availableListings: available,
    };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SafeUserSelect } from '../common/constants/safe-user.constant.js';
import { CreateLandlordRatingDto } from './dto/create-landlord-rating.dto.js';
import { UserRole } from '../../generated/prisma/index.js';

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

  // Landlord rating system (docs/ARCHITECTURE.md §5, "in scope, simulated" —
  // reuses the same "aggregate, don't let AI judge" shape as TrustLayer's
  // community reports, just without a registry signal to combine it with).
  async rateLandlord(
    landlordId: string,
    raterId: string,
    dto: CreateLandlordRatingDto,
  ) {
    if (landlordId === raterId) {
      throw new BadRequestException('You cannot rate yourself');
    }

    const landlord = await this.prisma.user.findUnique({
      where: { id: landlordId },
    });
    if (!landlord) throw new NotFoundException('Landlord not found');
    if (landlord.role !== UserRole.LANDLORD) {
      throw new BadRequestException('Only landlord accounts can be rated');
    }

    return this.prisma.landlordRating.create({
      data: { landlordId, raterId, rating: dto.rating, comment: dto.comment },
    });
  }

  async findLandlordRatings(landlordId: string) {
    const ratings = await this.prisma.landlordRating.findMany({
      where: { landlordId },
      orderBy: { createdAt: 'desc' },
    });

    const averageRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : null;

    return { ratings, averageRating, ratingCount: ratings.length };
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

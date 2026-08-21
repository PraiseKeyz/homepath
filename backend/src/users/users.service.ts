import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { SafeUserSelect } from '../common/constants/safe-user.constant.js';
import { CreateLandlordRatingDto } from './dto/create-landlord-rating.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UserRole, NotificationType } from '../../generated/prisma/index.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SafeUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    id: string,
    requestingUserId: string,
    dto: UpdateProfileDto,
  ) {
    if (id !== requestingUserId) {
      throw new ForbiddenException('You can only edit your own profile');
    }
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: SafeUserSelect,
    });
  }

  async changePassword(
    id: string,
    requestingUserId: string,
    dto: ChangePasswordDto,
  ) {
    if (id !== requestingUserId) {
      throw new ForbiddenException('You can only change your own password');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const currentValid = await argon2.verify(
      user.password,
      dto.currentPassword,
    );
    if (!currentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const password = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({ where: { id }, data: { password } });
    return { success: true };
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

    const rating = await this.prisma.landlordRating.create({
      data: { landlordId, raterId, rating: dto.rating, comment: dto.comment },
    });

    const rater = await this.prisma.user.findUnique({ where: { id: raterId } });
    await this.notificationsService.create(
      landlordId,
      NotificationType.RATING_RECEIVED,
      'New rating received',
      `${rater?.name ?? 'Someone'} rated you ${dto.rating}/5${dto.comment ? `: "${dto.comment}"` : '.'}`,
    );

    return rating;
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

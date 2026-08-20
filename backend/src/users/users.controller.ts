import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateLandlordRatingDto } from './dto/create-landlord-rating.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return { data: await this.usersService.findById(id) };
  }

  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return { data: await this.usersService.updateProfile(id, user.id, dto) };
  }

  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return { data: await this.usersService.changePassword(id, user.id, dto) };
  }

  // Ratings are public — a renter should be able to check a landlord's
  // history before signing up, same principle as public property browsing.
  @Public()
  @Get(':id/ratings')
  async findLandlordRatings(@Param('id') id: string) {
    return { data: await this.usersService.findLandlordRatings(id) };
  }

  @Post(':id/ratings')
  async rateLandlord(
    @Param('id') id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateLandlordRatingDto,
  ) {
    return { data: await this.usersService.rateLandlord(id, user.id, dto) };
  }

  @Public()
  @Get(':id/profile')
  async getLandlordProfile(@Param('id') id: string) {
    return { data: await this.usersService.findLandlordProfile(id) };
  }
}

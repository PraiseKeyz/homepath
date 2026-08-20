import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return { data: await this.usersService.findById(id) };
  }

  @Public()
  @Get(':id/profile')
  async getLandlordProfile(@Param('id') id: string) {
    return { data: await this.usersService.findLandlordProfile(id) };
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';

// Browsing is public — checking a property's Trust Score is the core pitch and
// shouldn't sit behind a signup wall. Creating a listing requires auth.
// See docs/ARCHITECTURE.md and the frontend (marketing)/(dashboard) route split.
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async create(@CurrentUser() user: SafeUser, @Body() dto: CreatePropertyDto) {
    return { data: await this.propertiesService.create(user.id, dto) };
  }

  @Public()
  @Get()
  async findAll() {
    return { data: await this.propertiesService.findAll() };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.propertiesService.findOne(id) };
  }
}

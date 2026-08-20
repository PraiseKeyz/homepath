import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CooperativesService } from './cooperatives.service.js';
import { CreateCooperativeDto } from './dto/create-cooperative.dto.js';
import { JoinCooperativeDto } from './dto/join-cooperative.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';
import { UserRole } from '../../generated/prisma/index.js';

@Controller('cooperatives')
export class CooperativesController {
  constructor(private readonly cooperativesService: CooperativesService) {}

  @Post()
  async create(@Body() dto: CreateCooperativeDto) {
    return { data: await this.cooperativesService.create(dto) };
  }

  @Get()
  async findAll() {
    return { data: await this.cooperativesService.findAll() };
  }

  @Roles(UserRole.DEVELOPER)
  @Get('demand-clusters')
  async demandClusters() {
    return { data: await this.cooperativesService.demandClusters() };
  }

  @Get('my-memberships')
  async myMemberships(@CurrentUser() user: SafeUser) {
    return { data: await this.cooperativesService.findMyMemberships(user.id) };
  }

  @Post(':id/join')
  async join(
    @Param('id') id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: JoinCooperativeDto,
  ) {
    return { data: await this.cooperativesService.join(id, user.id, dto) };
  }
}

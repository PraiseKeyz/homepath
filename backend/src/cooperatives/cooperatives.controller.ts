import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CooperativesService } from './cooperatives.service.js';
import { CreateCooperativeDto } from './dto/create-cooperative.dto.js';
import { JoinCooperativeDto } from './dto/join-cooperative.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';

@ApiTags('cooperatives')
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

  @Get('demand-clusters')
  async demandClusters() {
    return { data: await this.cooperativesService.demandClusters() };
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

import { Controller, Get, Param } from '@nestjs/common';
import { NeighbourhoodService } from './neighbourhood.service.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('neighbourhood')
export class NeighbourhoodController {
  constructor(private readonly neighbourhoodService: NeighbourhoodService) {}

  @Public()
  @Get()
  async findAll() {
    return { data: await this.neighbourhoodService.findAll() };
  }

  @Public()
  @Get(':areaKey')
  async findByAreaKey(@Param('areaKey') areaKey: string) {
    return { data: await this.neighbourhoodService.findByAreaKey(areaKey) };
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NeighbourhoodService } from './neighbourhood.service.js';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('neighbourhood')
@Controller('neighbourhood')
export class NeighbourhoodController {
  constructor(private readonly neighbourhoodService: NeighbourhoodService) {}

  @Public()
  @Get(':areaKey')
  async findByAreaKey(@Param('areaKey') areaKey: string) {
    return { data: await this.neighbourhoodService.findByAreaKey(areaKey) };
  }
}

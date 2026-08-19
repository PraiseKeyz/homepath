import { Module } from '@nestjs/common';
import { NeighbourhoodService } from './neighbourhood.service.js';
import { NeighbourhoodController } from './neighbourhood.controller.js';

@Module({
  providers: [NeighbourhoodService],
  controllers: [NeighbourhoodController],
  exports: [NeighbourhoodService],
})
export class NeighbourhoodModule {}

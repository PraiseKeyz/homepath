import { Module } from '@nestjs/common';
import { CooperativesService } from './cooperatives.service.js';
import { CooperativesController } from './cooperatives.controller.js';

@Module({
  providers: [CooperativesService],
  controllers: [CooperativesController],
  exports: [CooperativesService],
})
export class CooperativesModule {}

import { Module } from '@nestjs/common';
import { TrustLayerService } from './trust-layer.service.js';
import { TrustLayerController } from './trust-layer.controller.js';
import { AiExplanationService } from './ai-explanation.service.js';

@Module({
  providers: [TrustLayerService, AiExplanationService],
  controllers: [TrustLayerController],
  exports: [TrustLayerService],
})
export class TrustLayerModule {}

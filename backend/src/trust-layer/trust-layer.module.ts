import { Module } from '@nestjs/common';
import { TrustLayerService } from './trust-layer.service.js';
import { TrustLayerController } from './trust-layer.controller.js';
import { TrustLayerVerifyController } from './trust-layer-verify.controller.js';
import { AiExplanationService } from './ai-explanation.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  providers: [TrustLayerService, AiExplanationService],
  controllers: [TrustLayerController, TrustLayerVerifyController],
  exports: [TrustLayerService],
})
export class TrustLayerModule {}

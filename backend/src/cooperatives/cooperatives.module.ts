import { Module } from '@nestjs/common';
import { CooperativesService } from './cooperatives.service.js';
import { CooperativesController } from './cooperatives.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  providers: [CooperativesService],
  controllers: [CooperativesController],
  exports: [CooperativesService],
})
export class CooperativesModule {}

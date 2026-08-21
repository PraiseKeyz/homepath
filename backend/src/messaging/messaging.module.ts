import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service.js';
import { MessagingController } from './messaging.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  providers: [MessagingService],
  controllers: [MessagingController],
  exports: [MessagingService],
})
export class MessagingModule {}

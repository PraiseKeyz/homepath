import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findMine(@CurrentUser() user: SafeUser) {
    return { data: await this.notificationsService.findMine(user.id) };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return { data: await this.notificationsService.markRead(id, user.id) };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: SafeUser) {
    return { data: await this.notificationsService.markAllRead(user.id) };
  }
}

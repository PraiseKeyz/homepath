import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationType } from '../../generated/prisma/index.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Called from other services when a real event happens — never invoked to
  // simulate activity. See docs/ARCHITECTURE.md and the module-level comment
  // in prisma/schema/notification.prisma.
  create(userId: string, type: NotificationType, title: string, body: string) {
    return this.prisma.notification.create({
      data: { userId, type, title, body },
    });
  }

  findMine(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) {
      throw new ForbiddenException('This notification does not belong to you');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SafeUserSelect } from '../common/constants/safe-user.constant.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { NotificationType } from '../../generated/prisma/index.js';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async assertParticipant(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) {
      throw new ForbiddenException('You are not part of this conversation');
    }
  }

  // One conversation per (property, renter) pair — the owner is implied,
  // since every property has exactly one owner.
  async findOrCreateConversation(userId: string, dto: CreateConversationDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.ownerId === userId) {
      throw new BadRequestException(
        'You cannot message yourself about your own listing',
      );
    }

    const existing = await this.prisma.conversation.findFirst({
      where: {
        propertyId: dto.propertyId,
        participants: { some: { userId } },
      },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        propertyId: dto.propertyId,
        participants: {
          create: [{ userId }, { userId: property.ownerId }],
        },
      },
    });
  }

  findMyConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        property: {
          select: { id: true, title: true, address: true, imageUrl: true },
        },
        participants: { include: { user: { select: SafeUserSelect } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findMessages(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: SafeUserSelect } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
  ) {
    await this.assertParticipant(conversationId, userId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { conversationId, senderId: userId, body: dto.body },
        include: { sender: { select: SafeUserSelect } },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    const otherParticipants =
      await this.prisma.conversationParticipant.findMany({
        where: { conversationId, userId: { not: userId } },
      });
    await Promise.all(
      otherParticipants.map((p) =>
        this.notificationsService.create(
          p.userId,
          NotificationType.NEW_MESSAGE,
          `New message from ${message.sender.name}`,
          dto.body.length > 120 ? `${dto.body.slice(0, 120)}…` : dto.body,
        ),
      ),
    );

    return message;
  }
}

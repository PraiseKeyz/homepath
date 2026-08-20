import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagingService } from './messaging.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';

@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  async create(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateConversationDto,
  ) {
    return {
      data: await this.messagingService.findOrCreateConversation(user.id, dto),
    };
  }

  @Get()
  async findMine(@CurrentUser() user: SafeUser) {
    return { data: await this.messagingService.findMyConversations(user.id) };
  }

  @Get(':id/messages')
  async findMessages(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return { data: await this.messagingService.findMessages(id, user.id) };
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: SendMessageDto,
  ) {
    return { data: await this.messagingService.sendMessage(id, user.id, dto) };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SafeUserSelect } from '../common/constants/safe-user.constant.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SafeUserSelect });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

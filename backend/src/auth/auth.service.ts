import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SafeUser,
  SafeUserSelect,
} from '../common/constants/safe-user.constant.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const password = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password,
        phone: dto.phone,
        role: dto.role,
      },
      select: SafeUserSelect,
    });

    return { data: { user, accessToken: this.signToken(user.id) } };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await argon2.verify(user.password, dto.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };
    return { data: { user: safeUser, accessToken: this.signToken(user.id) } };
  }

  private signToken(userId: string) {
    return this.jwtService.sign({ sub: userId });
  }
}

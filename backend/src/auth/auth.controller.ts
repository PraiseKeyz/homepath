import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';
import { ACCESS_TOKEN_COOKIE, buildAuthCookieOptions } from './auth-cookie.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // Sets the JWT as an httpOnly cookie in addition to returning it in the body.
  // The cookie is what the browser attaches automatically on every subsequent
  // request (JwtStrategy already falls back to reading it) — the body value
  // stays for callers that still key off `accessToken` directly.
  private attachSessionCookie(res: Response, accessToken: string) {
    res.cookie(
      ACCESS_TOKEN_COOKIE,
      accessToken,
      buildAuthCookieOptions(this.configService),
    );
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.attachSessionCookie(res, result.data.accessToken);
    return result;
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.attachSessionCookie(res, result.data.accessToken);
    return result;
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    return { data: null, message: 'Logged out' };
  }

  @Get('me')
  me(@CurrentUser() user: SafeUser) {
    return { data: { user } };
  }
}

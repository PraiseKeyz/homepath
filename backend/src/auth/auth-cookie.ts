import type { CookieOptions } from 'express';
import type { ConfigService } from '@nestjs/config';
import { parseDurationToMs } from '../common/utils/duration.util.js';

// Must match the cookie name JwtStrategy reads as its fallback extractor
// (see auth/strategies/jwt.strategy.ts) — this is what lets the browser carry
// the session automatically instead of the frontend having to attach an
// Authorization header on every request.
export const ACCESS_TOKEN_COOKIE = 'access_token';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function buildAuthCookieOptions(
  configService: ConfigService,
): CookieOptions {
  const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '7d';
  return {
    httpOnly: true,
    secure: configService.get<string>('NODE_ENV') === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: parseDurationToMs(expiresIn, SEVEN_DAYS_MS),
  };
}

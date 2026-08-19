import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SafeUser } from '../constants/safe-user.constant.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SafeUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

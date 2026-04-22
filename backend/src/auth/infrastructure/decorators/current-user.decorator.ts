import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAggregate } from '@/auth/domain/user.aggregate';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserAggregate => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

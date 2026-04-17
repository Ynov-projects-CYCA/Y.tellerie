import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/auth/infrastructure/decorators';
import { UserAggregate } from '@/auth/domain';
import { Role } from '@/shared/model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user }: { user: UserAggregate } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.getProperties().roles?.includes(role));
  }
}

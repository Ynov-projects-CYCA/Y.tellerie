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
    // La garde autorise l'acces si l'utilisateur possede au moins un des roles
    // declares sur la route, ce qui laisse la possibilite de modeliser des OR.
    const userRoles = user.getProperties().roles ?? [];

    return requiredRoles.some(
      (role) =>
        userRoles.includes(role) ||
        (role === Role.PERSONNEL && userRoles.includes(Role.ADMIN)),
    );
  }
}

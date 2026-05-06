import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../../../../src/auth/infrastructure/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../src/auth/infrastructure/guards/roles.guard';
import { BookingsController } from '../../../../src/bookings/infrastructure/bookings.controller';
import { Role } from '../../../../src/shared/model';

describe('BookingsController staff route metadata', () => {
  it('should protect findAllForStaff with JwtAuthGuard and RolesGuard for personnel users', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      BookingsController.prototype.findAllForStaff,
    ) as Array<new () => unknown> | undefined;
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      BookingsController.prototype.findAllForStaff,
    ) as Role[] | undefined;

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([Role.PERSONNEL]);
  });

  it('should keep findAll protected only by JwtAuthGuard for the current client history', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      BookingsController.prototype.findAll,
    ) as Array<new () => unknown> | undefined;
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      BookingsController.prototype.findAll,
    ) as Role[] | undefined;

    expect(guards).toEqual([JwtAuthGuard]);
    expect(roles).toBeUndefined();
  });
});

import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../../../../src/auth/infrastructure/decorators/roles.decorator';
import { Role } from '../../../../src/auth/domain/role.vo';
import { JwtAuthGuard } from '../../../../src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../src/auth/infrastructure/guards/roles.guard';
import { RoomsController } from '../../../../src/rooms/infrastructure/rooms.controller';

describe('RoomsController auth metadata', () => {
  const protectedMethods: Array<keyof RoomsController> = [
    'create',
    'update',
    'remove',
    'checkout',
    'clean',
    'checkin',
  ];

  const publicMethods: Array<keyof RoomsController> = ['findAll', 'findOne'];

  it.each(protectedMethods)(
    'should protect %s with JwtAuthGuard and RolesGuard for personnel users',
    (methodName) => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        RoomsController.prototype[methodName],
      ) as Array<new () => unknown> | undefined;
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        RoomsController.prototype[methodName],
      ) as Role[] | undefined;

      expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
      expect(roles).toEqual([Role.PERSONNEL]);
    },
  );

  it.each(publicMethods)('should keep %s public', (methodName) => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      RoomsController.prototype[methodName],
    ) as Array<new () => unknown> | undefined;
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      RoomsController.prototype[methodName],
    ) as Role[] | undefined;

    expect(guards).toBeUndefined();
    expect(roles).toBeUndefined();
  });
});

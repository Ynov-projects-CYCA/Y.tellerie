import { RolesGuard } from '../../../../../src/auth/infrastructure/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '../../../../../src/auth/domain/role.vo';
import { UserAggregate } from '../../../../../src/auth/domain/user.aggregate';
import { UserProperties } from '../../../../../src/auth/domain/user.entity';
import { UserId } from '../../../../../src/auth/domain/user-id.vo';
import { Email } from '../../../../../src/auth/domain/email.vo';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: {} }),
      }),
    } as unknown as ExecutionContext;
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should return true if user has the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.CLIENT]);
    const userProps: UserProperties = {
      id: UserId.generate(),
      firstname: 'Test',
      lastname: 'User',
      phoneNumber: '+33612345678',
      isActive: false,
      verifyEmailToken: null,
      resetPasswordToken: null,
      email: Email.from('test@example.com'),
      passwordHash: 'hashed',
      roles: [Role.CLIENT],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const user = new UserAggregate(userProps);
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should return false if user does not have the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.PERSONNEL]);
    const userProps: UserProperties = {
      id: UserId.generate(),
      firstname: 'Test',
      lastname: 'User',
      phoneNumber: '+33612345678',
      isActive: false,
      verifyEmailToken: null,
      resetPasswordToken: null,
      email: Email.from('test@example.com'),
      passwordHash: 'hashed',
      roles: [Role.CLIENT],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const user = new UserAggregate(userProps);
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
    expect(rolesGuard.canActivate(context)).toBe(false);
  });
});

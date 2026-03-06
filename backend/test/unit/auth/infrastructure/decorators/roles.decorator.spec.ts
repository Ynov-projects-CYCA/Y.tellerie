import { ROLES_KEY, Roles } from '../../../../../src/auth/infrastructure/decorators/roles.decorator';
import { Role } from '../../../../../src/auth/domain/role.vo';
import { SetMetadata } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  it('should call SetMetadata with the correct key and roles', () => {
    const roles = [Role.CLIENT, Role.PERSONNEL];
    Roles(...roles);
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
  });
});

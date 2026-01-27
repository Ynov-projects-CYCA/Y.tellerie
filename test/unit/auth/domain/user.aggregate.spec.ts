import { UserAggregate } from '../../../../src/auth/domain/user.aggregate';
import { UserId } from '../../../../src/auth/domain/user-id.vo';
import { Email } from '../../../../src/auth/domain/email.vo';
import { Role } from '../../../../src/auth/domain/role.vo';
import { UserProperties } from '../../../../src/auth/domain/user.entity';

describe('UserAggregate', () => {
  let user: UserAggregate;

  beforeEach(() => {
    const userProps: UserProperties = {
      id: UserId.generate(),
      firstname: 'John',
      lastname: 'Doe',
      email: Email.from('john.doe@example.com'),
      passwordHash: 'hashed_password',
      roles: [Role.CLIENT],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    user = new UserAggregate(userProps);
  });

  it('should add a role to the user', () => {
    user.addRole(Role.PERSONNEL);
    const userProperties = user.getProperties();
    expect(userProperties.roles).toContain(Role.PERSONNEL);
  });

  it('should not add a role if it already exists', () => {
    user.addRole(Role.CLIENT);
    const userProperties = user.getProperties();
    expect(userProperties.roles).toEqual([Role.CLIENT]);
  });
});

import { UserFactory } from '../../../../src/auth/domain/user.factory';
import { Email } from '../../../../src/auth/domain/email.vo';
import { Role } from '../../../../src/auth/domain/role.vo';
import { IPasswordHasher } from '../../../../src/auth/application/ports/password-hasher.port';

describe('UserFactory', () => {
  const mockPasswordHasher: IPasswordHasher = {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
  };

  it('should create a user with the default CLIENT role', async () => {
    const user = await UserFactory.create(
      {
        firstname: 'John',
        lastname: 'Doe',
        email: Email.from('john.doe@example.com'),
        phone: '+33123456789',
        rawPassword: 'password123',
      },
      mockPasswordHasher,
    );

    const userProperties = user.getProperties();
    expect(userProperties.roles).toEqual([Role.CLIENT]);
    expect(userProperties.phone).toBe('+33123456789');
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
  });

  it('should create a user with a specific initial role', async () => {
    const user = await UserFactory.create(
      {
        firstname: 'Jane',
        lastname: 'Doe',
        email: Email.from('jane.doe@example.com'),
        phone: '+33987654321',
        rawPassword: 'password456',
      },
      mockPasswordHasher,
      Role.PERSONNEL,
    );

    const userProperties = user.getProperties();
    expect(userProperties.roles).toEqual([Role.PERSONNEL]);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password456');
  });
});

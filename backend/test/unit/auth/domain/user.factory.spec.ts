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
        phoneNumber: '+33612345678',
        email: Email.from('john.doe@example.com'),
        phone: '+33123456789',
        rawPassword: 'password123',
      },
      mockPasswordHasher,
    );

    const userProperties = user.getProperties();
    expect(userProperties.roles).toEqual([Role.CLIENT]);
    expect(userProperties.isActive).toBe(false);
    expect(userProperties.verifyEmailToken).toEqual(expect.any(String));
    expect(userProperties.verifyEmailToken).not.toHaveLength(0);
    expect(userProperties.resetPasswordToken).toBeNull();
    expect(userProperties.phone).toBe('+33123456789');
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
  });

  it('should create a user with a specific initial role', async () => {
    const user = await UserFactory.create(
      {
        firstname: 'Jane',
        lastname: 'Doe',
        phoneNumber: '+33687654321',
        email: Email.from('jane.doe@example.com'),
        phone: '+33987654321',
        rawPassword: 'password456',
      },
      mockPasswordHasher,
      Role.PERSONNEL,
    );

    const userProperties = user.getProperties();
    expect(userProperties.roles).toEqual([Role.PERSONNEL]);
    expect(userProperties.isActive).toBe(false);
    expect(userProperties.verifyEmailToken).toEqual(expect.any(String));
    expect(userProperties.verifyEmailToken).not.toHaveLength(0);
    expect(userProperties.resetPasswordToken).toBeNull();
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password456');
  });
});

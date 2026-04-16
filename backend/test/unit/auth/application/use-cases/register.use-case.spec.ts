import {
  RegisterUseCase,
  UserAlreadyExistsError,
} from '../../../../../src/auth/application/use-cases/register.use-case';
import { IUserRepository } from '../../../../../src/auth/application/ports/user-repository.port';
import { IPasswordHasher } from '../../../../../src/auth/application/ports/password-hasher.port';
import { Email } from '../../../../../src/auth/domain/email.vo';
import { Role } from '../../../../../src/auth/domain/role.vo';
import { UserAggregate } from '../../../../../src/auth/domain/user.aggregate';
import { UserProperties } from '../../../../../src/auth/domain/user.entity';
import { UserId } from '../../../../../src/auth/domain/user-id.vo';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: IPasswordHasher;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };
    mockPasswordHasher = {
      hash: jest.fn().mockResolvedValue('hashed_password'),
      compare: jest.fn().mockResolvedValue(true),
    };
    registerUseCase = new RegisterUseCase(
      mockUserRepository,
      mockPasswordHasher,
    );
  });

  it('should register a new user with phone and role', async () => {
    const email = Email.from('new.user@example.com');
    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    const result = await registerUseCase.execute({
      firstname: 'New',
      lastname: 'User',
      email,
      phone: '+33123456789',
      rawPassword: 'password123',
      role: Role.PERSONNEL,
    });

    expect(result).toBeInstanceOf(UserAggregate);
    expect(result.getProperties().phone).toBe('+33123456789');
    expect(result.getProperties().roles).toEqual([Role.PERSONNEL]);
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should reject duplicate emails', async () => {
    const email = Email.from('existing.user@example.com');
    const existingUserProps: UserProperties = {
      id: UserId.generate(),
      firstname: 'Existing',
      lastname: 'User',
      email,
      phone: '+33123456789',
      passwordHash: 'hashed_password',
      roles: [Role.CLIENT],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(
      new UserAggregate(existingUserProps),
    );

    await expect(
      registerUseCase.execute({
        firstname: 'Existing',
        lastname: 'User',
        email,
        phone: '+33123456789',
        rawPassword: 'password123',
        role: Role.CLIENT,
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });
});

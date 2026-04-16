import { ForbiddenException } from '@nestjs/common';
import { LoginUseCase } from '../../../../../src/auth/application/use-cases/login.use-case';
import { IPasswordHasher } from '../../../../../src/auth/application/ports/password-hasher.port';
import { ITokenGenerator } from '../../../../../src/auth/application/ports/token-generator.port';
import { IUserRepository } from '../../../../../src/auth/application/ports/user-repository.port';
import { AuthenticationDomainService } from '../../../../../src/auth/domain/authentication.domain-service';
import { Email } from '../../../../../src/auth/domain/email.vo';
import { Password } from '../../../../../src/auth/domain/password.vo';
import { Role } from '../../../../../src/auth/domain/role.vo';
import { UserAggregate } from '../../../../../src/auth/domain/user.aggregate';
import { UserId } from '../../../../../src/auth/domain/user-id.vo';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: IPasswordHasher;
  let mockTokenGenerator: ITokenGenerator;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByVerifyEmailToken: jest.fn(),
    };
    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };
    mockTokenGenerator = {
      generateAccessToken: jest.fn().mockResolvedValue('access-token'),
    };

    useCase = new LoginUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenGenerator,
      new AuthenticationDomainService(),
    );
  });

  it('should throw when the account is not active', async () => {
    const inactiveUser = new UserAggregate({
      id: UserId.generate(),
      firstname: 'John',
      lastname: 'Doe',
      phoneNumber: '+33612345678',
      isActive: false,
      verifyEmailToken: 'verify-token',
      resetPasswordToken: null,
      email: Email.from('john.doe@example.com'),
      phone: '+33123456789',
      passwordHash: 'hashed_password',
      roles: [Role.CLIENT],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(inactiveUser);

    await expect(
      useCase.execute({
        email: Email.from('john.doe@example.com'),
        password: Password.from('password123'),
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockTokenGenerator.generateAccessToken).not.toHaveBeenCalled();
  });

  it('should return an access token when the account is active', async () => {
    const activeUser = new UserAggregate({
      id: UserId.generate(),
      firstname: 'Jane',
      lastname: 'Doe',
      phoneNumber: '+33612345678',
      isActive: true,
      verifyEmailToken: null,
      resetPasswordToken: null,
      email: Email.from('jane.doe@example.com'),
      phone: '+33123456789',
      passwordHash: 'hashed_password',
      roles: [Role.CLIENT],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(activeUser);

    const result = await useCase.execute({
      email: Email.from('jane.doe@example.com'),
      password: Password.from('password123'),
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.user).toBe(activeUser);
  });
});

import { ForbiddenException } from '@nestjs/common';
import {
  AuthenticationDomainService,
  Email,
  IPasswordHasher,
  ITokenGenerator,
  IUserRepository,
  IRefreshTokenRepository,
  LoginUseCase,
  Password,
  Role,
  UserAggregate,
  UserId,
} from '../../../../../src/auth';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: IPasswordHasher;
  let mockTokenGenerator: ITokenGenerator;
  let mockRefreshTokenRepository: IRefreshTokenRepository;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByVerifyEmailToken: jest.fn(),
      delete: jest.fn(),
    };
    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };
    mockTokenGenerator = {
      generateAccessToken: jest.fn().mockResolvedValue('access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
    };
    mockRefreshTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      deleteByUserId: jest.fn(),
    };

    useCase = new LoginUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenGenerator,
      mockRefreshTokenRepository,
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
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user).toBe(activeUser);
  });
});

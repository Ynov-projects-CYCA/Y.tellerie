import {
  Email,
  InvalidPasswordResetTokenError,
  IPasswordHasher,
  IPasswordResetTokenRepository,
  IUserRepository,
  Password,
  PasswordResetToken,
  ResetPasswordUseCase,
  Role,
  UserAggregate,
  UserId,
} from '../../../../../src/auth';
import { createHash } from 'crypto';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepository: IUserRepository;
  let tokenRepository: IPasswordResetTokenRepository;
  let passwordHasher: IPasswordHasher;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByVerifyEmailToken: jest.fn(),
    };
    tokenRepository = {
      save: jest.fn(),
      findByTokenHash: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('new-hash'),
      compare: jest.fn().mockResolvedValue(true),
    };

    useCase = new ResetPasswordUseCase(
      userRepository,
      tokenRepository,
      passwordHasher,
    );
  });

  it('should update the password and mark the token as used', async () => {
    const rawToken = 'valid-token';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const userId = UserId.generate();
    const resetToken = PasswordResetToken.create(userId, tokenHash, 1);
    const user = new UserAggregate({
      id: userId,
      firstname: 'John',
      lastname: 'Doe',
      phoneNumber: '+33612345678',
      isActive: true,
      verifyEmailToken: null,
      resetPasswordToken: null,
      email: Email.from('john.doe@example.com'),
      phone: '+33123456789',
      passwordHash: 'old-hash',
      roles: [Role.CLIENT],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (tokenRepository.findByTokenHash as jest.Mock).mockResolvedValue(resetToken);
    (userRepository.findById as jest.Mock).mockResolvedValue(user);

    await useCase.execute({
      token: rawToken,
      password: Password.from('newPassword123'),
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('newPassword123');
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(tokenRepository.save).toHaveBeenCalled();
    expect(resetToken.isUsed()).toBe(true);
  });

  it('should reject invalid tokens', async () => {
    (tokenRepository.findByTokenHash as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        token: 'invalid-token',
        password: Password.from('newPassword123'),
      }),
    ).rejects.toThrow(InvalidPasswordResetTokenError);
  });
});

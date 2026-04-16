import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../src/auth/infrastructure/auth.controller';
import { RegisterUseCase, UserAlreadyExistsError } from '../../../../src/auth/application/use-cases/register.use-case';
import { LoginUseCase } from '../../../../src/auth/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../../../src/auth/application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '../../../../src/auth/application/use-cases/change-password.use-case';
import { LogoutUseCase } from '../../../../src/auth/application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../../../../src/auth/application/use-cases/forgot-password.use-case';
import {
  InvalidPasswordResetTokenError,
  ResetPasswordUseCase,
} from '../../../../src/auth/application/use-cases/reset-password.use-case';
import { RegisterDto } from '../../../../src/auth/application/dtos/register.dto';
import { UserAggregate } from '../../../../src/auth/domain/user.aggregate';
import { Role } from '../../../../src/auth/domain/role.vo';
import { Email } from '../../../../src/auth/domain/email.vo';
import { UserId } from '../../../../src/auth/domain/user-id.vo';
import { RefreshToken } from '../../../../src/auth/domain/refresh-token.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let registerUseCase: RegisterUseCase;
  let loginUseCase: LoginUseCase;
  let forgotPasswordUseCase: ForgotPasswordUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;

  const mockUserAggregate = new UserAggregate({
    id: UserId.generate(),
    firstname: 'John',
    lastname: 'Doe',
    email: Email.from('john.doe@example.com'),
    phone: '+33123456789',
    passwordHash: 'hashed_password',
    roles: [Role.CLIENT],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockRefreshToken = new RefreshToken({
    id: 'refresh_token_id',
    userId: mockUserAggregate.getProperties().id,
    expiresAt: new Date(),
    isRevoked: false,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LoginUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RefreshTokenUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ChangePasswordUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LogoutUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ForgotPasswordUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ResetPasswordUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    registerUseCase = module.get<RegisterUseCase>(RegisterUseCase);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    forgotPasswordUseCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
    resetPasswordUseCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  describe('register', () => {
    it('should register a user and return auth response', async () => {
      const registerDto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '+33123456789',
        password: 'password123',
        role: Role.CLIENT,
      };

      jest.spyOn(registerUseCase, 'execute').mockResolvedValue(mockUserAggregate);
      jest.spyOn(loginUseCase, 'execute').mockResolvedValue({
        user: mockUserAggregate,
        accessToken: 'access_token',
        refreshToken: mockRefreshToken,
      });

      const result = await authController.register(registerDto);

      expect(registerUseCase.execute).toHaveBeenCalled();
      expect(loginUseCase.execute).toHaveBeenCalled();
      expect(result.user.phone).toBe(registerDto.phone);
      expect(result.user.roles).toContain(Role.CLIENT);
    });

    it('should translate duplicate emails to ConflictException', async () => {
      jest
        .spyOn(registerUseCase, 'execute')
        .mockRejectedValue(new UserAlreadyExistsError('john.doe@example.com'));

      await expect(
        authController.register({
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          phone: '+33123456789',
          password: 'password123',
          role: Role.CLIENT,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('should login a user and return auth response', async () => {
      const loginDto = { email: 'john.doe@example.com', password: 'password123' };
      const req = { user: mockUserAggregate };

      jest.spyOn(loginUseCase, 'execute').mockResolvedValue({
        user: mockUserAggregate,
        accessToken: 'access_token',
        refreshToken: mockRefreshToken,
      });

      const result = await authController.login(req, loginDto);

      expect(loginUseCase.execute).toHaveBeenCalled();
      expect(result.user.phone).toBe(mockUserAggregate.getProperties().phone);
    });
  });

  describe('forgotPassword', () => {
    it('should delegate the request even when the user may not exist', async () => {
      jest.spyOn(forgotPasswordUseCase, 'execute').mockResolvedValue(undefined);

      await authController.forgotPassword({ email: 'john.doe@example.com' });

      expect(forgotPasswordUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset a password with a valid token', async () => {
      jest.spyOn(resetPasswordUseCase, 'execute').mockResolvedValue(undefined);

      await authController.resetPassword({
        token: 'valid-token',
        password: 'newPassword123',
      });

      expect(resetPasswordUseCase.execute).toHaveBeenCalled();
    });

    it('should translate invalid reset tokens to UnauthorizedException', async () => {
      jest
        .spyOn(resetPasswordUseCase, 'execute')
        .mockRejectedValue(new InvalidPasswordResetTokenError());

      await expect(
        authController.resetPassword({
          token: 'expired-token',
          password: 'newPassword123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});

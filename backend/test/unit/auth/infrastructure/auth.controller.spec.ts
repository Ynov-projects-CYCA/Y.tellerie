import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidPasswordResetTokenError,
  ResetPasswordUseCase,
} from '../../../../src/auth/application/use-cases/reset-password.use-case';
import { AuthController } from '../../../../src/auth/infrastructure/auth.controller';
import { ChangePasswordUseCase } from '../../../../src/auth/application/use-cases/change-password.use-case';
import { ForgotPasswordUseCase } from '../../../../src/auth/application/use-cases/forgot-password.use-case';
import { LoginUseCase } from '../../../../src/auth/application/use-cases/login.use-case';
import { RegisterUseCase, UserAlreadyExistsError } from '../../../../src/auth/application/use-cases/register.use-case';
import { VerifyEmailUseCase } from '../../../../src/auth/application/use-cases/verify-email.use-case';
import { RegisterDto } from '../../../../src/auth/application/dtos/register.dto';
import { Email } from '../../../../src/auth/domain/email.vo';
import { Role } from '../../../../src/shared/model/role.enum';
import { UserAggregate } from '../../../../src/auth/domain/user.aggregate';
import { UserId } from '../../../../src/auth/domain/user-id.vo';
import { SendTransactionalEmailUseCase } from '../../../../src/mailjet/application/use-cases/send-transactional-email.use-case';

describe('AuthController', () => {
  let authController: AuthController;
  let registerUseCase: RegisterUseCase;
  let loginUseCase: LoginUseCase;
  let verifyEmailUseCase: VerifyEmailUseCase;
  let forgotPasswordUseCase: ForgotPasswordUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;
  let changePasswordUseCase: ChangePasswordUseCase;
  let sendTransactionalEmailUseCase: SendTransactionalEmailUseCase;

  const mockUserAggregate = new UserAggregate({
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
          provide: ChangePasswordUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: VerifyEmailUseCase,
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
        {
          provide: SendTransactionalEmailUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app.frontendUrl') return 'http://localhost:4200';
              if (key === 'app.frontendBaseUrl') return 'http://localhost:4200';
              if (key === 'app.corsOrigins') return ['http://localhost:4200'];
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    registerUseCase = module.get<RegisterUseCase>(RegisterUseCase);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    verifyEmailUseCase = module.get<VerifyEmailUseCase>(VerifyEmailUseCase);
    forgotPasswordUseCase = module.get<ForgotPasswordUseCase>(
      ForgotPasswordUseCase,
    );
    resetPasswordUseCase = module.get<ResetPasswordUseCase>(
      ResetPasswordUseCase,
    );
    changePasswordUseCase = module.get<ChangePasswordUseCase>(
      ChangePasswordUseCase,
    );
    sendTransactionalEmailUseCase = module.get<SendTransactionalEmailUseCase>(
      SendTransactionalEmailUseCase,
    );
  });

  describe('register', () => {
    it('should register a user and send a verification email', async () => {
      const registerDto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        phoneNumber: '+33612345678',
        email: 'john.doe@example.com',
        phone: '+33123456789',
        password: 'password123',
        role: Role.CLIENT,
      };

      jest.spyOn(registerUseCase, 'execute').mockResolvedValue(mockUserAggregate);
      jest
        .spyOn(sendTransactionalEmailUseCase, 'execute')
        .mockResolvedValue({ messageId: 'mail_123' });

      const result = await authController.register(registerDto);

      expect(registerUseCase.execute).toHaveBeenCalled();
      expect(sendTransactionalEmailUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.objectContaining({ email: 'john.doe@example.com' }),
          subject: 'Confirmez votre adresse email Ytellerie',
          text: expect.stringContaining('Bienvenue sur Ytellerie.'),
          html: expect.stringContaining('Confirmer mon adresse email'),
        }),
      );
      expect(
        (sendTransactionalEmailUseCase.execute as jest.Mock).mock.calls[0][0]
          .html,
      ).toContain('Activez votre compte avec elegance');
      expect(result).toEqual(
        expect.objectContaining({
          message:
            'Compte cree. Verifiez votre adresse e-mail avant de vous connecter.',
        }),
      );
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should translate duplicate emails to ConflictException', async () => {
      jest
        .spyOn(registerUseCase, 'execute')
        .mockRejectedValue(new UserAlreadyExistsError('john.doe@example.com'));

      await expect(
        authController.register({
          firstname: 'John',
          lastname: 'Doe',
          phoneNumber: '+33612345678',
          email: 'john.doe@example.com',
          phone: '+33123456789',
          password: 'password123',
          role: Role.CLIENT,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('me', () => {
    it('should return the authenticated user', () => {
      const result = authController.getCurrentUser({ user: mockUserAggregate });

      expect(result).toEqual({
        id: mockUserAggregate.getProperties().id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        phoneNumber: '+33612345678',
        isActive: false,
        email: 'john.doe@example.com',
        phone: '+33123456789',
        roles: [Role.CLIENT],
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify a user email token', async () => {
      jest.spyOn(verifyEmailUseCase, 'execute').mockResolvedValue(undefined);

      const result = await authController.verifyEmail({ token: 'verify-token' });

      expect(verifyEmailUseCase.execute).toHaveBeenCalledWith('verify-token');
      expect(result).toEqual({
        message: 'Adresse e-mail verifiee avec succes.',
      });
    });
  });

  describe('login', () => {
    it('should login a user and return auth response', async () => {
      const req = { user: mockUserAggregate };

      jest.spyOn(loginUseCase, 'execute').mockResolvedValue({
        user: mockUserAggregate,
        accessToken: 'access_token',
      });

      const result = await authController.login(req, {
        email: 'john.doe@example.com',
        password: 'password123',
      });

      expect(loginUseCase.execute).toHaveBeenCalled();
      expect(result.accessToken).toBe('access_token');
      expect(result.user.phone).toBe('+33123456789');
    });
  });

  describe('forgotPassword', () => {
    it('should delegate the request', async () => {
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

  describe('modifyPassword', () => {
    it('should change the password for the authenticated user', async () => {
      jest.spyOn(changePasswordUseCase, 'execute').mockResolvedValue(undefined);

      await authController.modifyPassword(
        { user: mockUserAggregate },
        {
          oldPassword: 'oldPassword123',
          newPassword: 'newPassword123',
        },
      );

      expect(changePasswordUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should resolve without error', async () => {
      await expect(authController.logout()).resolves.toBeUndefined();
    });
  });
});

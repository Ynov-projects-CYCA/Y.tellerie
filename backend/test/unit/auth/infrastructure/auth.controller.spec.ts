import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../src/auth/infrastructure/auth.controller';
import { RegisterClientUseCase } from '../../../../src/auth/application/use-cases/register-client.use-case';
import { RegisterPersonnelUseCase } from '../../../../src/auth/application/use-cases/register-personnel.use-case';
import { LoginUseCase } from '../../../../src/auth/application/use-cases/login.use-case';
import { ChangePasswordUseCase } from '../../../../src/auth/application/use-cases/change-password.use-case';
import { VerifyEmailUseCase } from '../../../../src/auth/application/use-cases/verify-email.use-case';
import { RegisterDto } from '../../../../src/auth/application/dtos/register.dto';
import { UserAggregate } from '../../../../src/auth/domain/user.aggregate';
import { Role } from '../../../../src/auth/domain/role.vo';
import { Email } from '../../../../src/auth/domain/email.vo';
import { UserId } from '../../../../src/auth/domain/user-id.vo';
import { SendTransactionalEmailUseCase } from '../../../../src/mailjet/application/use-cases/send-transactional-email.use-case';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let authController: AuthController;
  let registerClientUseCase: RegisterClientUseCase;
  let loginUseCase: LoginUseCase;
  let sendTransactionalEmailUseCase: SendTransactionalEmailUseCase;
  let verifyEmailUseCase: VerifyEmailUseCase;

  const mockUserAggregate = new UserAggregate({
    id: UserId.generate(),
    firstname: 'John',
    lastname: 'Doe',
    phoneNumber: '+33612345678',
    isActive: false,
    verifyEmailToken: 'verify-token',
    resetPasswordToken: null,
    email: Email.from('john.doe@example.com'),
    passwordHash: 'hashed_password',
    roles: [Role.CLIENT],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterClientUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RegisterPersonnelUseCase,
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
          provide: SendTransactionalEmailUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app.frontendUrl') return 'http://localhost:4200';
              if (key === 'app.corsOrigins') return ['http://localhost:4200'];
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    registerClientUseCase = module.get<RegisterClientUseCase>(RegisterClientUseCase);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    sendTransactionalEmailUseCase = module.get<SendTransactionalEmailUseCase>(
      SendTransactionalEmailUseCase,
    );
    verifyEmailUseCase = module.get<VerifyEmailUseCase>(VerifyEmailUseCase);
  });

  describe('register', () => {
    it('should register a client and return auth response by default', async () => {
      const registerDto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        phoneNumber: '+33612345678',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      jest.spyOn(registerClientUseCase, 'execute').mockResolvedValue(mockUserAggregate);
      jest.spyOn(loginUseCase, 'execute').mockResolvedValue({
        user: mockUserAggregate,
        accessToken: 'access_token',
      });
      
      const result = await authController.register(registerDto);

      expect(registerClientUseCase.execute).toHaveBeenCalled();
      expect(authController['registerPersonnelUseCase'].execute).not.toHaveBeenCalled();
      expect(sendTransactionalEmailUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.objectContaining({ email: 'john.doe@example.com' }),
          subject: 'Verify your email address',
        }),
      );
      expect(loginUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Account created. Verify your email before logging in.',
        }),
      );
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should register a personnel and return auth response when role is personnel', async () => {
      const registerDto: RegisterDto = {
        firstname: 'Jane',
        lastname: 'Doe',
        phoneNumber: '+33687654321',
        role: Role.PERSONNEL,
        email: 'jane.doe@example.com',
        password: 'password123',
      };
      const personnelUserAggregate = new UserAggregate({
        ...mockUserAggregate.getProperties(),
        firstname: 'Jane',
        phoneNumber: '+33687654321',
        email: Email.from('jane.doe@example.com'),
        roles: [Role.PERSONNEL]
      });

      jest.spyOn(authController['registerPersonnelUseCase'], 'execute').mockResolvedValue(personnelUserAggregate);
      jest.spyOn(loginUseCase, 'execute').mockResolvedValue({
        user: personnelUserAggregate,
        accessToken: 'access_token',
      });

      const result = await authController.register(registerDto);

      expect(authController['registerPersonnelUseCase'].execute).toHaveBeenCalled();
      expect(registerClientUseCase.execute).not.toHaveBeenCalled();
      expect(sendTransactionalEmailUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.objectContaining({ email: 'jane.doe@example.com' }),
          subject: 'Verify your email address',
        }),
      );
      expect(loginUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Account created. Verify your email before logging in.',
        }),
      );
      expect(result.user.roles).toContain(Role.PERSONNEL);
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
        roles: [Role.CLIENT],
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify a user email token', async () => {
      jest.spyOn(verifyEmailUseCase, 'execute').mockResolvedValue(undefined);

      const result = await authController.verifyEmail({ token: 'verify-token' });

      expect(verifyEmailUseCase.execute).toHaveBeenCalledWith('verify-token');
      expect(result).toEqual({ message: 'Email verified successfully.' });
    });
  });

  describe('login', () => {
    it('should login a user and return auth response', async () => {
      const loginDto = { email: 'john.doe@example.com', password: 'password123' };
      const req = { user: mockUserAggregate };

      jest.spyOn(loginUseCase, 'execute').mockResolvedValue({
        user: mockUserAggregate,
        accessToken: 'access_token',
      });

      const result = await authController.login(req, loginDto);

      expect(loginUseCase.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('changePassword', () => {
    it('should change the password', async () => {
      const changePasswordUseCase = authController['changePasswordUseCase'];
      jest.spyOn(changePasswordUseCase, 'execute').mockResolvedValue(undefined);
      const req = { user: mockUserAggregate };
      const changePasswordDto = { oldPassword: 'oldPassword123', newPassword: 'newPassword123' };

      await authController.changePassword(req, changePasswordDto);

      expect(changePasswordUseCase.execute).toHaveBeenCalled();
    });
  });
});

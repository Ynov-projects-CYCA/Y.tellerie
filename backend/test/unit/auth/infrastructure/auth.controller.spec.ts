import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../src/auth/infrastructure/auth.controller';
import { RegisterClientUseCase } from '../../../../src/auth/application/use-cases/register-client.use-case';
import { RegisterPersonnelUseCase } from '../../../../src/auth/application/use-cases/register-personnel.use-case';
import { LoginUseCase } from '../../../../src/auth/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../../../src/auth/application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '../../../../src/auth/application/use-cases/change-password.use-case';
import { LogoutUseCase } from '../../../../src/auth/application/use-cases/logout.use-case';
import { RegisterDto } from '../../../../src/auth/application/dtos/register.dto';
import { UserAggregate } from '../../../../src/auth/domain/user.aggregate';
import { Role } from '../../../../src/auth/domain/role.vo';
import { Email } from '../../../../src/auth/domain/email.vo';
import { UserId } from '../../../../src/auth/domain/user-id.vo';
import { RefreshToken } from '../../../../src/auth/domain/refresh-token.entity';
import { HttpStatus } from '@nestjs/common';
import { Password } from '../../../../src/auth/domain/password.vo';

describe('AuthController', () => {
  let authController: AuthController;
  let registerClientUseCase: RegisterClientUseCase;
  let loginUseCase: LoginUseCase;

  const mockUserAggregate = new UserAggregate({
    id: UserId.generate(),
    firstname: 'John',
    lastname: 'Doe',
    phoneNumber: '+33612345678',
    email: Email.from('john.doe@example.com'),
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
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    registerClientUseCase = module.get<RegisterClientUseCase>(RegisterClientUseCase);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  describe('registerClient', () => {
    it('should register a client and return auth response', async () => {
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
        refreshToken: mockRefreshToken,
      });
      
      const result = await authController.registerClient(registerDto);

      expect(registerClientUseCase.execute).toHaveBeenCalled();
      expect(loginUseCase.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
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
        email: 'john.doe@example.com',
        roles: [Role.CLIENT],
      });
    });
  });

  describe('registerPersonnel', () => {
    it('should register a personnel and return auth response', async () => {
      const registerDto: RegisterDto = {
        firstname: 'Jane',
        lastname: 'Doe',
        phoneNumber: '+33687654321',
        email: 'jane.doe@example.com',
        password: 'password123',
      };
      const personnelUserAggregate = new UserAggregate({
        ...mockUserAggregate.getProperties(),
        roles: [Role.PERSONNEL]
      });

      jest.spyOn(authController['registerPersonnelUseCase'], 'execute').mockResolvedValue(personnelUserAggregate);
      jest.spyOn(loginUseCase, 'execute').mockResolvedValue({
        user: personnelUserAggregate,
        accessToken: 'access_token',
        refreshToken: mockRefreshToken,
      });

      const result = await authController.registerPersonnel(registerDto);

      expect(authController['registerPersonnelUseCase'].execute).toHaveBeenCalled();
      expect(loginUseCase.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.roles).toContain(Role.PERSONNEL);
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
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const logoutUseCase = authController['logoutUseCase'];
      jest.spyOn(logoutUseCase, 'execute').mockResolvedValue(undefined);
      const refreshTokenDto = { refreshToken: 'refresh_token_id' };
      
      await authController.logout(refreshTokenDto);

      expect(logoutUseCase.execute).toHaveBeenCalledWith({ refreshTokenId: 'refresh_token_id' });
    });
  });

  describe('refresh', () => {
    it('should refresh the token and return auth response', async () => {
      const refreshTokenUseCase = authController['refreshTokenUseCase'];
      jest.spyOn(refreshTokenUseCase, 'execute').mockResolvedValue({
        user: mockUserAggregate,
        accessToken: 'new_access_token',
        refreshToken: mockRefreshToken,
      });
      const refreshTokenDto = { refreshToken: 'refresh_token_id' };

      const result = await authController.refresh(refreshTokenDto);
      
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({ refreshTokenId: 'refresh_token_id' });
      expect(result.accessToken).toBe('new_access_token');
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

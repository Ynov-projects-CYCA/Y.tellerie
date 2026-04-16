import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  RegisterUseCase,
  UserAlreadyExistsError,
} from '../application/use-cases/register.use-case';
import {
  LoginUseCase,
  InvalidCredentialsError,
} from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.use-case';
import {
  InvalidPasswordResetTokenError,
  ResetPasswordUseCase,
} from '../application/use-cases/reset-password.use-case';
import { RegisterDto } from '../application/dtos/register.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { ChangePasswordDto } from '../application/dtos/change-password.dto';
import { ForgotPasswordDto } from '../application/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../application/dtos/reset-password.dto';
import { Email } from '../domain/email.vo';
import { Password } from '../domain/password.vo';
import { AuthResponseDto } from '../application/dtos/auth-response.dto';
import { UserAggregate } from '../domain/user.aggregate';
import { RefreshTokenDto } from '../application/dtos/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and log them in' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered and logged in.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists.',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    try {
      const user = await this.registerUseCase.execute({
        firstname: registerDto.firstname,
        lastname: registerDto.lastname,
        email: Email.from(registerDto.email),
        phone: registerDto.phone,
        rawPassword: registerDto.password,
        role: registerDto.role,
      });

      const { accessToken, refreshToken } = await this.loginUseCase.execute({
        email: user.getProperties().email,
        password: await Password.from(registerDto.password),
      });

      return this.toAuthResponse(user, accessToken, refreshToken.getProperties().id);
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException('User with this email already exists.');
      }

      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
  })
  async login(
    @Request() req: { user: UserAggregate },
    @Body() _loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    try {
      const { user, accessToken, refreshToken } =
        await this.loginUseCase.execute({
        email: req.user.getProperties().email,
        password: Password.from(_loginDto.password),
        });

      return this.toAuthResponse(
        user,
        accessToken,
        refreshToken.getProperties().id,
      );
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException('Invalid email or password.');
      }

      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out a user by revoking their refresh token' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully logged out.',
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.logoutUseCase.execute({
      refreshTokenId: refreshTokenDto.refreshToken,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens successfully refreshed.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token.',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const { user, accessToken, refreshToken } =
      await this.refreshTokenUseCase.execute({
        refreshTokenId: refreshTokenDto.refreshToken,
      });

    return this.toAuthResponse(user, accessToken, refreshToken.getProperties().id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Password reset request accepted.',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this.forgotPasswordUseCase.execute({
      email: Email.from(forgotPasswordDto.email),
    });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset a password using a token received by email' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Password successfully reset.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired password reset token.',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    try {
      await this.resetPasswordUseCase.execute({
        token: resetPasswordDto.token,
        password: Password.from(resetPasswordDto.password),
      });
    } catch (error) {
      if (error instanceof InvalidPasswordResetTokenError) {
        throw new UnauthorizedException(
          'Invalid or expired password reset token.',
        );
      }

      throw error;
    }
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Password successfully changed.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated.',
  })
  async changePassword(
    @Request() req: { user: UserAggregate },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    await this.changePasswordUseCase.execute({
      userId: req.user.getProperties().id,
      oldPassword: Password.from(changePasswordDto.oldPassword),
      newPassword: Password.from(changePasswordDto.newPassword),
    });
  }

  private toAuthResponse(
    user: UserAggregate,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    const userProps = user.getProperties();

    return {
      accessToken,
      refreshToken,
      user: {
        id: userProps.id.toString(),
        firstname: userProps.firstname,
        lastname: userProps.lastname,
        email: userProps.email.toString(),
        phone: userProps.phone,
        roles: userProps.roles,
      },
    };
  }
}

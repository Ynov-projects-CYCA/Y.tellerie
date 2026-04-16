import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SendTransactionalEmailUseCase } from '../../mailjet/application/use-cases/send-transactional-email.use-case';
import {
  buildActionEmailHtml,
  buildActionEmailText,
} from '../../mailjet/application/templates/action-email.template';
import {
  AuthResponseDto,
  RegisterResponseDto,
  UserResponse,
} from '../application/dtos/auth-response.dto';
import { ChangePasswordDto } from '../application/dtos/change-password.dto';
import { ForgotPasswordDto } from '../application/dtos/forgot-password.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { RegisterDto } from '../application/dtos/register.dto';
import { ResetPasswordDto } from '../application/dtos/reset-password.dto';
import { VerifyEmailDto } from '../application/dtos/verify-email.dto';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.use-case';
import {
  InvalidCredentialsError,
  LoginUseCase,
  UserCannotLoginError,
} from '../application/use-cases/login.use-case';
import { RegisterUseCase, UserAlreadyExistsError } from '../application/use-cases/register.use-case';
import {
  InvalidPasswordResetTokenError,
  ResetPasswordUseCase,
} from '../application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from '../application/use-cases/verify-email.use-case';
import { Email } from '../domain/email.vo';
import { Password } from '../domain/password.vo';
import { Role } from '../domain/role.vo';
import { UserAggregate } from '../domain/user.aggregate';
import { InvalidOldPasswordError } from '../application/use-cases/change-password.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly sendTransactionalEmailUseCase: SendTransactionalEmailUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current authenticated user.',
    type: UserResponse,
  })
  getCurrentUser(@Request() req: { user: UserAggregate }): UserResponse {
    return this.mapUserResponse(req.user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered. Email verification required.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists.',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    try {
      const user = await this.registerUseCase.execute({
        firstname: registerDto.firstname,
        lastname: registerDto.lastname,
        phoneNumber: registerDto.phoneNumber,
        email: Email.from(registerDto.email),
        phone: registerDto.phone,
        rawPassword: registerDto.password,
        role: registerDto.role ?? Role.CLIENT,
      });

      await this.sendVerificationEmail(user);

      return {
        message: 'Account created. Verify your email before logging in.',
        user: this.mapUserResponse(user),
      };
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
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Account is not active.',
  })
  async login(
    @Request() req: { user: UserAggregate },
    @Body() loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    try {
      const { user, accessToken } = await this.loginUseCase.execute({
        email: req.user.getProperties().email,
        password: Password.from(loginDto.password),
      });

      return {
        accessToken,
        user: this.mapUserResponse(user),
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException('Invalid email or password.');
      }

      if (error instanceof UserCannotLoginError) {
        throw new ForbiddenException(
          'Account is not active. Verify your email before logging in.',
        );
      }

      throw error;
    }
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a user email address' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email successfully verified.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Verification token is invalid or missing.',
  })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    await this.verifyEmailUseCase.execute(verifyEmailDto.token);

    return { message: 'Email verified successfully.' };
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

  @Patch('modify-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Modify the current user password' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Password successfully changed.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated.',
  })
  async modifyPassword(
    @Request() req: { user: UserAggregate },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    try {
      await this.changePasswordUseCase.execute({
        userId: req.user.getProperties().id,
        oldPassword: Password.from(changePasswordDto.oldPassword),
        newPassword: Password.from(changePasswordDto.newPassword),
      });
    } catch (error) {
      if (error instanceof InvalidOldPasswordError) {
        throw new UnauthorizedException('The old password does not match.');
      }

      throw error;
    }
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Deprecated alias for modify-password' })
  @ApiBearerAuth()
  async changePassword(
    @Request() req: { user: UserAggregate },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.modifyPassword(req, changePasswordDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out the current user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully logged out.',
  })
  async logout(): Promise<void> {
    return;
  }

  private mapUserResponse(user: UserAggregate): UserResponse {
    const properties = user.getProperties();

    return {
      id: properties.id.toString(),
      firstname: properties.firstname,
      lastname: properties.lastname,
      phoneNumber: properties.phoneNumber,
      isActive: properties.isActive,
      email: properties.email.toString(),
      phone: properties.phone,
      roles: properties.roles,
    };
  }

  private async sendVerificationEmail(user: UserAggregate): Promise<void> {
    const properties = user.getProperties();
    const token = properties.verifyEmailToken;

    if (!token) {
      return;
    }

    const verificationUrl = this.buildVerificationUrl(token);
    const recipientName = `${properties.firstname} ${properties.lastname}`.trim();
    const templateParams = {
      recipientName,
      preheader: 'Confirmation de compte',
      title: 'Activez votre compte avec elegance',
      intro: 'Bienvenue sur Ytellerie.',
      body: 'Confirmez votre adresse email pour finaliser votre inscription et acceder a votre espace.',
      ctaLabel: 'Confirmer mon adresse email',
      actionUrl: verificationUrl,
      footerNote:
        "Si vous n'etes pas a l'origine de cette inscription, vous pouvez ignorer cet email.",
    };

    try {
      await this.sendTransactionalEmailUseCase.execute({
        to: {
          email: properties.email.toString(),
          name: recipientName,
        },
        subject: 'Confirmez votre adresse email Ytellerie',
        text: buildActionEmailText(templateParams),
        html: buildActionEmailHtml(templateParams),
      });
    } catch (error) {
      this.logger.warn(
        `Verification email failed for ${properties.email.toString()}: ${
          (error as Error).message
        }`,
      );
    }
  }

  private buildVerificationUrl(token: string): string {
    const configuredFrontendUrl =
      this.configService.get<string>('app.frontendUrl')?.trim();
    const frontendBaseUrl =
      this.configService.get<string>('app.frontendBaseUrl')?.trim();
    const corsOrigins = this.configService.get<string[]>('app.corsOrigins') ?? [];
    const baseUrl =
      configuredFrontendUrl ||
      frontendBaseUrl ||
      corsOrigins[0] ||
      'http://localhost:4200';

    return `${baseUrl.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(
      token,
    )}`;
  }
}

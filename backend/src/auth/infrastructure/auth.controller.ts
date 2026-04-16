import {
  Get,
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterClientUseCase } from '../application/use-cases/register-client.use-case';
import { RegisterPersonnelUseCase } from '../application/use-cases/register-personnel.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { VerifyEmailUseCase } from '../application/use-cases/verify-email.use-case';
import { RegisterDto } from '../application/dtos/register.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { ChangePasswordDto } from '../application/dtos/change-password.dto';
import { VerifyEmailDto } from '../application/dtos/verify-email.dto';
import { Email } from '../domain/email.vo';
import { Password } from '../domain/password.vo';
import {
  AuthResponseDto,
  RegisterResponseDto,
  UserResponse,
} from '../application/dtos/auth-response.dto';
import { UserAggregate } from '../domain/user.aggregate';
import { Role } from '../domain/role.vo';
import { SendTransactionalEmailUseCase } from '../../mailjet/application/use-cases/send-transactional-email.use-case';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly registerPersonnelUseCase: RegisterPersonnelUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and log them in' })
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
    const user =
      registerDto.role === Role.PERSONNEL
        ? await this.registerPersonnelUseCase.execute({
            firstname: registerDto.firstname,
            lastname: registerDto.lastname,
            phoneNumber: registerDto.phoneNumber,
            email: Email.from(registerDto.email),
            rawPassword: registerDto.password,
          })
        : await this.registerClientUseCase.execute({
            firstname: registerDto.firstname,
            lastname: registerDto.lastname,
            phoneNumber: registerDto.phoneNumber,
            email: Email.from(registerDto.email),
            rawPassword: registerDto.password,
          });

    await this.sendVerificationEmail(user);

    return {
      message: 'Account created. Verify your email before logging in.',
      user: this.mapUserResponse(user),
    };
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
    @Body() _loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    const { user, accessToken } = await this.loginUseCase.execute(
      {
        email: req.user.getProperties().email,
        password: Password.from(_loginDto.password),
      },
    );

    return {
      accessToken,
      user: this.mapUserResponse(user),
    };
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

  private mapUserResponse(user: UserAggregate): UserResponse {
    const properties = user.getProperties();

    return {
      id: properties.id.toString(),
      firstname: properties.firstname,
      lastname: properties.lastname,
      phoneNumber: properties.phoneNumber,
      isActive: properties.isActive,
      email: properties.email.toString(),
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

    try {
      await this.sendTransactionalEmailUseCase.execute({
        to: {
          email: properties.email.toString(),
          name: `${properties.firstname} ${properties.lastname}`.trim(),
        },
        subject: 'Verify your email address',
        text: `Welcome to Archi Hotel. Verify your account: ${verificationUrl}`,
        html: `<p>Welcome to Archi Hotel.</p><p><a href="${verificationUrl}">Verify your account</a></p>`,
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
    const corsOrigins = this.configService.get<string[]>('app.corsOrigins') ?? [];
    const baseUrl =
      configuredFrontendUrl ||
      corsOrigins[0] ||
      'http://localhost:4200';

    return `${baseUrl.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(
      token,
    )}`;
  }
}

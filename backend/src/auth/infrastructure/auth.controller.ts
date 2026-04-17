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
import { SendTransactionalEmailUseCase } from '@/mailjet/application/use-cases/send-transactional-email.use-case';
import {
  buildActionEmailHtml,
  buildActionEmailText,
} from '@/mailjet/application/templates/action-email.template';
import {
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  RegisterResponseDto,
  ResetPasswordDto,
  UserResponse,
  VerifyEmailDto,
} from '@/auth/application/dtos';
import {
  ChangePasswordUseCase,
  ForgotPasswordUseCase,
  InvalidCredentialsError,
  LoginUseCase,
  RegisterUseCase,
  UserAlreadyExistsError,
  UserCannotLoginError,
  InvalidPasswordResetTokenError,
  ResetPasswordUseCase,
  VerifyEmailUseCase,
  InvalidOldPasswordError,
} from '@/auth/application/use-cases';
import { Email, Password, UserAggregate } from '@/auth/domain';
import { Role } from '@/shared/model';

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
    description: "Utilisateur inscrit avec succes. Verification de l'email requise.",
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un utilisateur avec cet email existe deja.',
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
        message: 'Compte cree. Verifiez votre adresse e-mail avant de vous connecter.',
        user: this.mapUserResponse(user),
      };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException('Un utilisateur avec cet email existe deja.');
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
    description: 'Utilisateur connecte avec succes.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Identifiants invalides.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Le compte n'est pas actif.",
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
        throw new UnauthorizedException('Email ou mot de passe invalide.');
      }

      if (error instanceof UserCannotLoginError) {
        throw new ForbiddenException(
          "Le compte n'est pas actif. Verifiez votre adresse e-mail avant de vous connecter.",
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
    description: 'Adresse e-mail verifiee avec succes.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Le jeton de verification est invalide ou manquant.',
  })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    await this.verifyEmailUseCase.execute(verifyEmailDto.token);

    return { message: 'Adresse e-mail verifiee avec succes.' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Demande de reinitialisation du mot de passe acceptee.',
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
    description: 'Mot de passe reinitialise avec succes.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Le jeton de reinitialisation du mot de passe est invalide ou expire.',
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
          'Le jeton de reinitialisation du mot de passe est invalide ou expire.',
        );
      }

      throw error;
    }
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Modifier le mot de passe de l utilisateur connecte' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Mot de passe modifie avec succes.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifie.',
  })
  async changePassword(
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
        throw new UnauthorizedException("L'ancien mot de passe ne correspond pas.");
      }

      throw error;
    }
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

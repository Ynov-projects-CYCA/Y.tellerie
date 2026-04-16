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
    const recipientName = `${properties.firstname} ${properties.lastname}`.trim();

    try {
      await this.sendTransactionalEmailUseCase.execute({
        to: {
          email: properties.email.toString(),
          name: recipientName,
        },
        subject: 'Confirmez votre adresse email Ytellerie',
        text: this.buildVerificationEmailText(recipientName, verificationUrl),
        html: this.buildVerificationEmailHtml(recipientName, verificationUrl),
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

  private buildVerificationEmailText(
    recipientName: string,
    verificationUrl: string,
  ): string {
    const greeting = recipientName ? `Bonjour ${recipientName},` : 'Bonjour,';

    return [
      greeting,
      '',
      'Bienvenue sur Ytellerie.',
      "Confirmez votre adresse email pour activer votre compte et commencer a gerer votre hotel avec elegance.",
      '',
      `Confirmer mon adresse email : ${verificationUrl}`,
      '',
      "Si vous n'etes pas a l'origine de cette inscription, vous pouvez ignorer cet email.",
      '',
      'Ytellerie',
    ].join('\n');
  }

  private buildVerificationEmailHtml(
    recipientName: string,
    verificationUrl: string,
  ): string {
    const greeting = recipientName ? `Bonjour ${recipientName},` : 'Bonjour,';

    return `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verification email Ytellerie</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f7f0dd;font-family:Arial,sans-serif;color:#7b3400;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f7f0dd;margin:0;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background-color:#fffaf0;border:1px solid #e8cf9d;border-radius:24px;overflow:hidden;">
                  <tr>
                    <td style="padding:28px 32px;border-bottom:1px solid #edd9b2;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size:16px;font-weight:700;letter-spacing:0.2px;color:#8d3f03;">
                            Ytellerie
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:44px 32px 24px 32px;text-align:center;">
                      <div style="display:inline-block;padding:10px 18px;border:1px solid #f1c24b;border-radius:12px;background-color:#fff4cc;color:#a14c08;font-size:14px;line-height:20px;">
                        Confirmation de compte
                      </div>
                      <h1 style="margin:28px 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-size:54px;line-height:1.05;font-weight:500;color:#6d2a00;">
                        Activez votre compte avec elegance
                      </h1>
                      <p style="margin:0 0 12px 0;font-size:18px;line-height:30px;color:#9a4708;">
                        ${greeting}
                      </p>
                      <p style="margin:0 0 12px 0;font-size:18px;line-height:30px;color:#9a4708;">
                        Bienvenue sur Ytellerie. Confirmez votre adresse email pour finaliser votre inscription et acceder a votre espace.
                      </p>
                      <p style="margin:0 0 36px 0;font-size:18px;line-height:30px;color:#9a4708;">
                        Une fois votre email valide, vous pourrez demarrer votre experience dans un environnement sobre, clair et professionnel.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 18px auto;">
                        <tr>
                          <td align="center" bgcolor="#ae4f00" style="border-radius:16px;">
                            <a href="${verificationUrl}" style="display:inline-block;padding:18px 32px;font-size:18px;font-weight:700;line-height:22px;color:#fffaf0;text-decoration:none;border:1px solid #ae4f00;border-radius:16px;">
                              Confirmer mon adresse email
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0;font-size:14px;line-height:24px;color:#a4693a;">
                        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                      </p>
                      <p style="margin:10px 0 0 0;font-size:14px;line-height:24px;word-break:break-all;">
                        <a href="${verificationUrl}" style="color:#8d3f03;text-decoration:underline;">${verificationUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 32px 32px 32px;background-color:#fcf5e7;border-top:1px solid #edd9b2;text-align:center;">
                      <p style="margin:0 0 8px 0;font-size:13px;line-height:22px;color:#a4693a;">
                        Si vous n'etes pas a l'origine de cette inscription, vous pouvez ignorer cet email.
                      </p>
                      <p style="margin:0;font-size:13px;line-height:22px;color:#a4693a;">
                        Ytellerie
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `.trim();
  }
}

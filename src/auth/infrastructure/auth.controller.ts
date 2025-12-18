import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { RegisterDto } from '../application/dtos/register.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { ChangePasswordDto } from '../application/dtos/change-password.dto';
import { Email } from '../domain/email.vo';
import { Password } from '../domain/password.vo';
import { AuthResponseDto } from '../application/dtos/auth-response.dto';
import { UserAggregate } from '../domain/user.aggregate';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    await this.registerUserUseCase.execute({
      firstname: registerDto.firstname,
      lastname: registerDto.lastname,
      email: Email.from(registerDto.email),
      rawPassword: registerDto.password,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  async login(
    @Request() req: { user: UserAggregate },
    @Body() _loginDto: LoginDto, // DTO is validated by the pipe
  ): Promise<AuthResponseDto> {
    const { user, accessToken, refreshToken } = await this.loginUseCase.execute({
      email: req.user.getProperties().email,
      password: new Password(_loginDto.password), // Re-create for the use case
    });

    return {
      accessToken,
      refreshToken: refreshToken.getProperties().id,
      user: {
        id: user.getProperties().id.toString(),
        firstname: user.getProperties().firstname,
        lastname: user.getProperties().lastname,
        email: user.getProperties().email.toString(),
        roles: user.getProperties().roles,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @Request() req: { user: { accessToken: string; refreshToken: any } },
  ): Promise<AuthResponseDto> {
    const { user, accessToken, refreshToken } = req.user;
    return {
      accessToken,
      refreshToken: refreshToken.getProperties().id,
      user: {
        id: user.getProperties().id.toString(),
        firstname: user.getProperties().firstname,
        lastname: user.getProperties().lastname,
        email: user.getProperties().email.toString(),
        roles: user.getProperties().roles,
      },
    };
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
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
}

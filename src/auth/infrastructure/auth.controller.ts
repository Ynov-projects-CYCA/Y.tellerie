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
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { RegisterDto } from '../application/dtos/register.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { ChangePasswordDto } from '../application/dtos/change-password.dto';
import { Email } from '../domain/email.vo';
import { Password } from '../domain/password.vo';
import { AuthResponseDto } from '../application/dtos/auth-response.dto';
import { UserAggregate } from '../domain/user.aggregate';
import { RefreshTokenDto } from '../application/dtos/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly registerPersonnelUseCase: RegisterPersonnelUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register/client')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new client and log them in' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Client successfully registered and logged in.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists.',
  })
  async registerClient(
    @Body() registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    const user = await this.registerClientUseCase.execute({
      firstname: registerDto.firstname,
      lastname: registerDto.lastname,
      email: Email.from(registerDto.email),
      rawPassword: registerDto.password,
    });

    const { accessToken, refreshToken } = await this.loginUseCase.execute({
      email: user.getProperties().email,
      password: await Password.from(registerDto.password),
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

  @Post('register/personnel')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new personnel and log them in' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Personnel successfully registered and logged in.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists.',
  })
  async registerPersonnel(
    @Body() registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    const user = await this.registerPersonnelUseCase.execute({
      firstname: registerDto.firstname,
      lastname: registerDto.lastname,
      email: Email.from(registerDto.email),
      rawPassword: registerDto.password,
    });

    const { accessToken, refreshToken } = await this.loginUseCase.execute({
      email: user.getProperties().email,
      password: await Password.from(registerDto.password),
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
  async login(
    @Request() req: { user: UserAggregate },
    @Body() _loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    const { user, accessToken, refreshToken } = await this.loginUseCase.execute({
      email: req.user.getProperties().email,
      password: Password.from(_loginDto.password),
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
}
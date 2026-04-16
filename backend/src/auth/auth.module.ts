import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailjetModule } from '../mailjet/mailjet.module';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import {
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
} from './application/ports/password-hasher.port';
import {
  IPasswordResetTokenRepository,
  IPasswordResetTokenRepository as IPasswordResetTokenRepositorySymbol,
} from './application/ports/password-reset-token-repository.port';
import {
  ITokenGenerator,
  ITokenGenerator as ITokenGeneratorSymbol,
} from './application/ports/token-generator.port';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from './application/ports/user-repository.port';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { LocalStrategy } from './application/strategies/local.strategy';
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt-password-hasher.adapter';
import { JwtTokenGenerator } from './infrastructure/adapters/jwt-token-generator.adapter';
import { TypeOrmPasswordResetTokenRepository } from './infrastructure/adapters/typeorm-password-reset-token-repository.adapter';
import { TypeOrmUserRepository } from './infrastructure/adapters/typeorm-user-repository.adapter';
import { AuthController } from './infrastructure/auth.controller';
import { PasswordResetTokenSchema } from './infrastructure/persistence/typeorm/password-reset-token.schema';
import { UserSchema } from './infrastructure/persistence/typeorm/user.schema';
import { AuthenticationDomainService } from './domain/authentication.domain-service';

@Module({
  imports: [
    ConfigModule,
    MailjetModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ??
          configService.get<string>('app.jwtSecret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    TypeOrmModule.forFeature([UserSchema, PasswordResetTokenSchema]),
  ],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    ChangePasswordUseCase,
    VerifyEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    AuthenticationDomainService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: IPasswordHasherSymbol,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: IPasswordResetTokenRepositorySymbol,
      useClass: TypeOrmPasswordResetTokenRepository,
    },
    {
      provide: ITokenGeneratorSymbol,
      useClass: JwtTokenGenerator,
    },
    {
      provide: IUserRepositorySymbol,
      useClass: TypeOrmUserRepository,
    },
  ],
  controllers: [AuthController],
  exports: [
    IPasswordHasherSymbol,
    IPasswordResetTokenRepositorySymbol,
    ITokenGeneratorSymbol,
    IUserRepositorySymbol,
  ],
})
export class AuthModule {}

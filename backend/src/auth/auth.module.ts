import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailjetModule } from '@/mailjet/mailjet.module';
import {
  ChangePasswordUseCase,
  ForgotPasswordUseCase,
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
  IPasswordResetTokenRepository,
  IPasswordResetTokenRepository as IPasswordResetTokenRepositorySymbol,
  IRefreshTokenRepository,
  IRefreshTokenRepository as IRefreshTokenRepositorySymbol,
  ITokenGenerator,
  ITokenGenerator as ITokenGeneratorSymbol,
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
  JwtStrategy,
  LocalStrategy,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
  ResetPasswordUseCase,
  VerifyEmailUseCase,
} from './index';
import {
  BcryptPasswordHasher,
  JwtTokenGenerator,
  TypeOrmPasswordResetTokenRepository,
  TypeOrmRefreshTokenRepositoryAdapter,
  TypeOrmUserRepository,
} from './infrastructure/adapters';
import { AuthController } from './infrastructure/auth.controller';
import { PasswordResetTokenSchema } from './infrastructure/persistence/typeorm/password-reset-token.schema';
import { UserSchema } from './infrastructure/persistence/typeorm/user.schema';
import { RefreshTokenSchema } from './infrastructure/persistence/typeorm/refresh-token.schema';
import { AuthenticationDomainService } from './domain';

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
    TypeOrmModule.forFeature([
      UserSchema,
      PasswordResetTokenSchema,
      RefreshTokenSchema,
    ]),
  ],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
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
      provide: IRefreshTokenRepositorySymbol,
      useClass: TypeOrmRefreshTokenRepositoryAdapter,
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
    IRefreshTokenRepositorySymbol,
    ITokenGeneratorSymbol,
    IUserRepositorySymbol,
  ],
})
export class AuthModule {}

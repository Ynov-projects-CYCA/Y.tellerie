import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPasswordHasher } from './application/ports/password-hasher.port';
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt-password-hasher.adapter';
import {
  IRefreshTokenRepository,
  IRefreshTokenRepository as IRefreshTokenRepositorySymbol,
} from './application/ports/refresh-token-repository.port';
import { TypeOrmRefreshTokenRepository } from './infrastructure/adapters/typeorm-refresh-token-repository.adapter';
import {
  ITokenGenerator,
  ITokenGenerator as ITokenGeneratorSymbol,
} from './application/ports/token-generator.port';
import { JwtTokenGenerator } from './infrastructure/adapters/jwt-token-generator.adapter';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from './application/ports/user-repository.port';
import { TypeOrmUserRepository } from './infrastructure/adapters/typeorm-user-repository.adapter';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { AuthenticationDomainService } from './domain/authentication.domain-service';
import { LocalStrategy } from './application/strategies/local.strategy';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { RefreshTokenStrategy } from './application/strategies/refresh-token.strategy';
import { AuthController } from './infrastructure/auth.controller';
import { UserSchema } from './infrastructure/persistence/typeorm/user.schema';
import { RefreshTokenSchema } from './infrastructure/persistence/typeorm/refresh-token.schema';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    TypeOrmModule.forFeature([UserSchema, RefreshTokenSchema]),
  ],
  providers: [
    // Use Cases
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    // Domain Services
    AuthenticationDomainService,
    // Strategies
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    // Adapters (mapping ports to implementations)
    {
      provide: IPasswordHasher,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: IRefreshTokenRepositorySymbol,
      useClass: TypeOrmRefreshTokenRepository,
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
})
export class AuthModule {}

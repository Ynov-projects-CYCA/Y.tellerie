import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailjetModule } from '../mailjet/mailjet.module';
import { IPasswordHasher } from './application/ports/password-hasher.port';
import {
  ITokenGenerator as ITokenGeneratorSymbol
} from './application/ports/token-generator.port';
import {
  IUserRepository as IUserRepositorySymbol
} from './application/ports/user-repository.port';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { LocalStrategy } from './application/strategies/local.strategy';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterClientUseCase } from './application/use-cases/register-client.use-case';
import { RegisterPersonnelUseCase } from './application/use-cases/register-personnel.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { AuthenticationDomainService } from './domain/authentication.domain-service';
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt-password-hasher.adapter';
import { JwtTokenGenerator } from './infrastructure/adapters/jwt-token-generator.adapter';
import { TypeOrmUserRepository } from './infrastructure/adapters/typeorm-user-repository.adapter';
import { AuthController } from './infrastructure/auth.controller';
import { UserSchema } from './infrastructure/persistence/typeorm/user.schema';

@Module({
  imports: [
    ConfigModule,
    MailjetModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    TypeOrmModule.forFeature([UserSchema]),
  ],
  providers: [
    // Use Cases
    RegisterClientUseCase,
    RegisterPersonnelUseCase,
    LoginUseCase,
    ChangePasswordUseCase,
    VerifyEmailUseCase,
    // Domain Services
    AuthenticationDomainService,
    // Strategies
    LocalStrategy,
    JwtStrategy,
    // Adapters (mapping ports to implementations)
    {
      provide: IPasswordHasher,
      useClass: BcryptPasswordHasher,
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

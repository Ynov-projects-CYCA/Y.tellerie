import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../domain/email.vo';
import { Password } from '../../domain/password.vo';
import {
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
} from '../ports/password-hasher.port';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '../ports/user-repository.port';
import {
  ITokenGenerator,
  ITokenGenerator as ITokenGeneratorSymbol,
} from '../ports/token-generator.port';
import { AuthenticationDomainService } from '../../domain/authentication.domain-service';
import { UserAggregate } from '../../domain/user.aggregate';
import { RefreshToken } from '../../domain/refresh-token.entity';
import {
  IRefreshTokenRepository,
  IRefreshTokenRepository as IRefreshTokenRepositorySymbol,
} from '../ports/refresh-token-repository.port';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
  }
}

export class UserCannotLoginError extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} is not allowed to log in.`);
  }
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasherSymbol)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(ITokenGeneratorSymbol)
    private readonly tokenGenerator: ITokenGenerator,
    @Inject(IRefreshTokenRepositorySymbol)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly authDomainService: AuthenticationDomainService,
  ) {}

  async execute(command: {
    email: Email;
    password: Password;
  }): Promise<{ user: UserAggregate; accessToken: string; refreshToken: RefreshToken }> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const userProps = user.getProperties();

    const isPasswordValid = await this.passwordHasher.compare(
      command.password.toString(),
      userProps.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    if (!this.authDomainService.canUserLogin(user)) {
      throw new UserCannotLoginError(userProps.id.toString());
    }

    const accessToken = await this.tokenGenerator.generateAccessToken(user);
    // TODO: Make token lifetime configurable
    const refreshToken = RefreshToken.create(userProps.id, 7);

    await this.refreshTokenRepository.save(refreshToken);

    return { user, accessToken, refreshToken };
  }
}

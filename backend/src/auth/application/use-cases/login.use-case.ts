import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

export class InvalidCredentialsError extends UnauthorizedException {
  constructor() {
    super('Invalid email or password.');
  }
}

export class UserCannotLoginError extends ForbiddenException {
  constructor() {
    super('Account is not active. Verify your email before logging in.');
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
    private readonly authDomainService: AuthenticationDomainService,
  ) {}

  async execute(command: { email: Email; password: Password }): Promise<{
    user: UserAggregate;
    accessToken: string;
  }> {
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
      throw new UserCannotLoginError();
    }

    const accessToken = await this.tokenGenerator.generateAccessToken(user);
    return { user, accessToken };
  }
}

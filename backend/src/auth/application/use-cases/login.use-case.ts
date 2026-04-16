import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationDomainService, Email, Password, UserAggregate } from '@/auth/domain';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
  ITokenGenerator,
  ITokenGenerator as ITokenGeneratorSymbol,
} from '@/auth/application/ports';


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

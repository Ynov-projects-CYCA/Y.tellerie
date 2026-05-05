import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationDomainService, Email, Password, UserAggregate, Role } from '@/auth/domain';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
  ITokenGenerator,
  ITokenGenerator as ITokenGeneratorSymbol,
  IRefreshTokenRepository,
  IRefreshTokenRepository as IRefreshTokenRepositorySymbol,
} from '@/auth/application/ports';
import { RefreshToken } from '../../domain/refresh-token.entity';

export class InvalidCredentialsError extends UnauthorizedException {
  constructor() {
    super('Email ou mot de passe invalide.');
  }
}

export class UserCannotLoginError extends ForbiddenException {
  constructor() {
    super(
      "Le compte n'est pas actif. Verifiez votre adresse e-mail avant de vous connecter.",
    );
  }
}

export class UnauthorizedRoleError extends ForbiddenException {
  constructor() {
    super("Vous n'avez pas les droits nécessaires pour accéder à ce portail.");
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

  async execute(command: { email: Email; password: Password; requiredRole?: Role }): Promise<{
    user: UserAggregate;
    accessToken: string;
    refreshToken: string;
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

    if (
      command.requiredRole &&
      !this.userHasRequiredRole(user.getProperties().roles, command.requiredRole)
    ) {
      throw new UnauthorizedRoleError();
    }

    // On supprime les anciens tokens pour l'utilisateur (optionnel, mais propre)
    await this.refreshTokenRepository.deleteByUserId(userProps.id);

    const accessToken = await this.tokenGenerator.generateAccessToken(user);
    const refreshTokenValue = this.tokenGenerator.generateRefreshToken();

    const refreshToken = RefreshToken.create(userProps.id, refreshTokenValue, 7); // 7 jours
    await this.refreshTokenRepository.save(refreshToken);

    return { user, accessToken, refreshToken: refreshTokenValue };
  }

  private userHasRequiredRole(userRoles: Role[], requiredRole: Role): boolean {
    if (userRoles.includes(requiredRole)) {
      return true;
    }

    return requiredRole === Role.PERSONNEL && userRoles.includes(Role.ADMIN);
  }
}

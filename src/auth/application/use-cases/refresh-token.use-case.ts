import { Inject, Injectable } from '@nestjs/common';
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
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '../ports/user-repository.port';

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid or expired refresh token.');
  }
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(IRefreshTokenRepositorySymbol)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(ITokenGeneratorSymbol)
    private readonly tokenGenerator: ITokenGenerator,
    private readonly authDomainService: AuthenticationDomainService,
  ) {}

  async execute(command: { refreshTokenId: string }): Promise<{
    user: UserAggregate;
    accessToken: string;
    refreshToken: RefreshToken;
  }> {
    const oldRefreshToken = await this.refreshTokenRepository.findByTokenId(
      command.refreshTokenId,
    );
    if (!oldRefreshToken) {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.userRepository.findById(
      oldRefreshToken.getProperties().userId,
    );
    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    if (!this.authDomainService.isRefreshTokenValid(oldRefreshToken, user)) {
      throw new InvalidRefreshTokenError();
    }

    oldRefreshToken.revoke();
    await this.refreshTokenRepository.save(oldRefreshToken);

    const accessToken = await this.tokenGenerator.generateAccessToken(user);
    const newRefreshToken = RefreshToken.create(user.getProperties().id, 7);

    await this.refreshTokenRepository.save(newRefreshToken);

    return { user, accessToken, refreshToken: newRefreshToken };
  }
}

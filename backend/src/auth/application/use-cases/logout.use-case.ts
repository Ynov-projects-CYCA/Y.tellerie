import { Inject, Injectable } from '@nestjs/common';
import {
  IRefreshTokenRepository,
  IRefreshTokenRepository as IRefreshTokenRepositorySymbol,
} from '../ports/refresh-token-repository.port';

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Refresh token not found.');
  }
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(IRefreshTokenRepositorySymbol)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: { refreshTokenId: string }): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findByTokenId(
      command.refreshTokenId,
    );

    if (!refreshToken) {
      return;
    }

    refreshToken.revoke();
    await this.refreshTokenRepository.save(refreshToken);
  }
}

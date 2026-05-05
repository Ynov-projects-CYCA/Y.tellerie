import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
  ITokenGenerator,
  ITokenGenerator as ITokenGeneratorSymbol,
  IRefreshTokenRepository,
  IRefreshTokenRepository as IRefreshTokenRepositorySymbol,
} from '@/auth/application/ports';
import { RefreshToken } from '../../domain/refresh-token.entity';
import { UserAggregate } from '@/auth/domain';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IRefreshTokenRepositorySymbol)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(ITokenGeneratorSymbol)
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(refreshTokenValue: string): Promise<{
    user: UserAggregate;
    accessToken: string;
    refreshToken: string;
  }> {
    const refreshToken = await this.refreshTokenRepository.findByToken(refreshTokenValue);

    if (!refreshToken || !refreshToken.isValid()) {
      throw new UnauthorizedException('Token de rafraîchissement invalide ou expiré.');
    }

    const user = await this.userRepository.findById(refreshToken.getProperties().userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    // On révoque l'ancien token pour en générer un nouveau (rotation)
    await this.refreshTokenRepository.deleteByUserId(refreshToken.getProperties().userId);

    const accessToken = await this.tokenGenerator.generateAccessToken(user);
    const newRefreshTokenValue = this.tokenGenerator.generateRefreshToken();

    const newRefreshToken = RefreshToken.create(
      refreshToken.getProperties().userId,
      newRefreshTokenValue,
      7,
    );
    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      user,
      accessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}

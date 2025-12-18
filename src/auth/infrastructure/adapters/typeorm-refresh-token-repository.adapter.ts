import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRefreshTokenRepository } from '../../../application/ports/refresh-token-repository.port';
import { RefreshToken } from '../../../domain/refresh-token.entity';
import { UserId } from '../../../domain/user-id.vo';

@Injectable()
export class TypeOrmRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async save(token: RefreshToken): Promise<void> {
    const tokenProps = token.getProperties();
    await this.refreshTokenRepository.save(tokenProps);
  }

  async findByUserId(userId: UserId): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { userId },
    });
  }

  async findByTokenId(tokenId: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { id: tokenId },
    });
  }
}

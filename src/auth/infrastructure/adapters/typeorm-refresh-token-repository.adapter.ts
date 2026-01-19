import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRefreshTokenRepository } from '../../application/ports/refresh-token-repository.port';
import { RefreshToken } from '../../domain/refresh-token.entity';
import { UserId } from '../../domain/user-id.vo';
import { RefreshTokenOrmEntity, RefreshTokenSchema } from '../persistence/typeorm/refresh-token.schema';

@Injectable()
export class TypeOrmRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenSchema)
    private readonly refreshTokenRepository: Repository<RefreshTokenOrmEntity>,
  ) {}

  async save(token: RefreshToken): Promise<void> {
    const tokenProps = token.getProperties();
    const tokenOrmEntity: RefreshTokenOrmEntity = {
      id: tokenProps.id,
      userId: tokenProps.userId.toString(),
      expiresAt: tokenProps.expiresAt,
      isRevoked: tokenProps.isRevoked,
    };
    await this.refreshTokenRepository.save(tokenOrmEntity);
  }

  async findByUserId(userId: UserId): Promise<RefreshToken[]> {
    const tokensOrmEntity = await this.refreshTokenRepository.find({
      where: { userId: userId.toString() },
    });
    return tokensOrmEntity.map((t) => new RefreshToken({
        id: t.id,
        userId: UserId.from(t.userId),
        expiresAt: t.expiresAt,
        isRevoked: t.isRevoked,
      }),
    );
  }

  async findByTokenId(tokenId: string): Promise<RefreshToken | null> {
    const tokenOrmEntity = await this.refreshTokenRepository.findOne({
      where: { id: tokenId },
    });
    if (!tokenOrmEntity) {
      return null;
    }
    return new RefreshToken({
      id: tokenOrmEntity.id,
      userId: UserId.from(tokenOrmEntity.userId),
      expiresAt: tokenOrmEntity.expiresAt,
      isRevoked: tokenOrmEntity.isRevoked,
    });
  }
}

import { RefreshToken } from '../../domain/refresh-token.entity';
import { UserId } from '../../domain/user-id.vo';

export const IRefreshTokenRepository = Symbol('IRefreshTokenRepository');

export interface IRefreshTokenRepository {
  save(token: RefreshToken): Promise<void>;
  findByUserId(userId: UserId): Promise<RefreshToken[]>;
  findByTokenId(tokenId: string): Promise<RefreshToken | null>;
}

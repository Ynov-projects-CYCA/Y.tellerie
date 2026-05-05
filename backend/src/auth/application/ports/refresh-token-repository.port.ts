import { RefreshToken } from '@/auth/domain/refresh-token.entity';
import { UserId } from '@/auth/domain';

export const IRefreshTokenRepository = Symbol('IRefreshTokenRepository');

export interface IRefreshTokenRepository {
  save(refreshToken: RefreshToken): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByUserId(userId: UserId): Promise<void>;
}

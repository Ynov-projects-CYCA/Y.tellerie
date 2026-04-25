import { UserId } from '@/auth/domain';

export interface RefreshTokenProperties {
  id: string;
  userId: UserId;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

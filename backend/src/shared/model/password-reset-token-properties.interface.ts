import { UserId } from '@/auth/domain';

export interface PasswordResetTokenProperties {
  id: string;
  userId: UserId;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

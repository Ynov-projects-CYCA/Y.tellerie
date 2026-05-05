import { PasswordResetToken } from '@/auth/domain';

export const IPasswordResetTokenRepository = Symbol(
  'IPasswordResetTokenRepository',
);

export interface IPasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
}

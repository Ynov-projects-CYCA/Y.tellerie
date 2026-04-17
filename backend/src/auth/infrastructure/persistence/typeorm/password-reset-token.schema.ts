import { EntitySchema } from 'typeorm';

export class PasswordResetTokenOrmEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export const PasswordResetTokenSchema =
  new EntitySchema<PasswordResetTokenOrmEntity>({
    name: 'PasswordResetToken',
    tableName: 'password_reset_tokens',
    columns: {
      id: {
        type: 'uuid',
        primary: true,
      },
      userId: {
        type: 'uuid',
        name: 'user_id',
      },
      tokenHash: {
        type: 'varchar',
        unique: true,
        name: 'token_hash',
      },
      expiresAt: {
        type: 'timestamp with time zone',
        name: 'expires_at',
      },
      usedAt: {
        type: 'timestamp with time zone',
        nullable: true,
        name: 'used_at',
      },
      createdAt: {
        type: 'timestamp with time zone',
        createDate: true,
        name: 'created_at',
      },
    },
  });

import { EntitySchema } from 'typeorm';

export class RefreshTokenOrmEntity {
  id: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
}

export const RefreshTokenSchema = new EntitySchema<RefreshTokenOrmEntity>({
  name: 'RefreshToken',
  tableName: 'refresh_tokens',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
    },
    userId: {
      type: 'uuid',
      name: 'user_id',
    },
    expiresAt: {
      type: 'timestamp with time zone',
      name: 'expires_at',
    },
    isRevoked: {
      type: 'boolean',
      name: 'is_revoked',
      default: false,
    },
  },
});

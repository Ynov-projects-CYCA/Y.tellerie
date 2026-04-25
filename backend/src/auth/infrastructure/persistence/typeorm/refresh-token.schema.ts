import { EntitySchema } from 'typeorm';
import { RefreshTokenProperties } from '@/shared/model';

export const RefreshTokenSchema = new EntitySchema<RefreshTokenProperties>({
  name: 'RefreshToken',
  tableName: 'refresh_tokens',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
    },
    userId: {
      type: 'uuid',
    },
    token: {
      type: 'varchar',
      unique: true,
    },
    expiresAt: {
      type: 'timestamp with time zone',
    },
    isRevoked: {
      type: 'boolean',
      default: false,
    },
    createdAt: {
      type: 'timestamp with time zone',
      createDate: true,
    },
  },
  indices: [
    {
      name: 'IDX_REFRESH_TOKEN_USER',
      columns: ['userId'],
    },
  ],
});

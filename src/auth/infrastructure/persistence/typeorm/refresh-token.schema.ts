import { EntitySchema } from 'typeorm';
import { RefreshToken } from '../../../domain/refresh-token.entity';
import { UserId } from '../../../domain/user-id.vo';

export const RefreshTokenSchema = new EntitySchema<RefreshToken>({
  name: 'RefreshToken',
  tableName: 'refresh_tokens',
  target: RefreshToken,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
    },
    userId: {
      type: 'uuid',
      name: 'user_id',
      transformer: {
        to: (value: UserId): string => value.toString(),
        from: (value: string): UserId => UserId.from(value),
      },
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
  relations: {
    // If we wanted to link back to the User entity directly in the DB
    // user: {
    //   type: 'many-to-one',
    //   target: 'User',
    //   joinColumn: {
    //     name: 'user_id',
    //   },
    // },
  },
});

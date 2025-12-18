import { EntitySchema } from 'typeorm';
import { User, UserProperties } from '../../../domain/user.entity';
import { UserId } from '../../../domain/user-id.vo';
import { Email } from '../../../domain/email.vo';
import { Role } from '../../../domain/role.vo';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  target: User,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      transformer: {
        to: (value: UserId): string => value.toString(),
        from: (value: string): UserId => UserId.from(value),
      },
    },
    firstname: {
      type: 'varchar',
    },
    lastname: {
      type: 'varchar',
    },
    email: {
      type: 'varchar',
      unique: true,
      transformer: {
        to: (value: Email): string => value.toString(),
        from: (value: string): Email => Email.from(value),
      },
    },
    passwordHash: {
      type: 'varchar',
      name: 'password_hash',
    },
    roles: {
      type: 'jsonb',
      default: [Role.USER],
    },
    createdAt: {
      type: 'timestamp with time zone',
      createDate: true,
      name: 'created_at',
    },
    updatedAt: {
      type: 'timestamp with time zone',
      updateDate: true,
      name: 'updated_at',
    },
  },
  // This is needed to map the raw DB data back to our domain entity
  // which has a constructor that expects a single properties object.
  // We need a custom repository method or a factory to use this properly.
  // For now, we assume TypeORM can handle this mapping if the properties match.
});
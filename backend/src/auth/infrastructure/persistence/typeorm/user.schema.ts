import { EntitySchema } from 'typeorm';
import { Role } from '../../../domain/role.vo';

export class UserOrmEntity {
  id: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  email: string;
  passwordHash: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new EntitySchema<UserOrmEntity>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
    },
    firstname: {
      type: 'varchar',
    },
    lastname: {
      type: 'varchar',
    },
    phoneNumber: {
      type: 'varchar',
      name: 'phone_number',
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    passwordHash: {
      type: 'varchar',
      name: 'password_hash',
    },
    roles: {
      type: 'jsonb',
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
});

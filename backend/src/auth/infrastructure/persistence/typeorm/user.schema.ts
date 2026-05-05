import { EntitySchema } from 'typeorm';
import { Role } from '@/shared/model';

export class UserOrmEntity {
  id: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  isActive: boolean;
  verifyEmailToken: string | null;
  resetPasswordToken: string | null;
  email: string;
  phone: string;
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
    isActive: {
      type: 'boolean',
      name: 'is_active',
      default: false,
    },
    verifyEmailToken: {
      type: 'varchar',
      name: 'verify_email_token',
      nullable: true,
    },
    resetPasswordToken: {
      type: 'varchar',
      name: 'reset_password_token',
      nullable: true,
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    phone: {
      type: 'varchar',
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

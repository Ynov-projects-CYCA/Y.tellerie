import { Email, UserId } from '@/auth/domain';
import { Role } from './role.enum';

export interface UserProperties {
  id: UserId;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  isActive: boolean;
  verifyEmailToken: string | null;
  resetPasswordToken: string | null;
  email: Email;
  phone: string;
  passwordHash: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

import { Email } from './email.vo';
import { UserId } from './user-id.vo';
import { Role, UserProperties } from '@/shared/model';

export type { UserProperties };

export class User {
  private readonly id: UserId;
  private firstname: string;
  private lastname: string;
  private phoneNumber: string;
  private isActive: boolean;
  private verifyEmailToken: string | null;
  private resetPasswordToken: string | null;
  private email: Email;
  private phone: string;
  private passwordHash: string;
  private roles: Role[];
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(properties: UserProperties) {
    Object.assign(this, properties);
  }

  getProperties(): UserProperties {
    return {
      id: this.id,
      firstname: this.firstname,
      lastname: this.lastname,
      phoneNumber: this.phoneNumber,
      isActive: this.isActive,
      verifyEmailToken: this.verifyEmailToken,
      resetPasswordToken: this.resetPasswordToken,
      email: this.email,
      phone: this.phone,
      passwordHash: this.passwordHash,
      roles: this.roles,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  changePassword(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }

  verifyEmail() {
    this.isActive = true;
    this.verifyEmailToken = null;
    this.updatedAt = new Date();
  }
}

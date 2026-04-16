import { Email } from './email.vo';
import { Role } from './role.vo';
import { UserId } from './user-id.vo';

export interface UserProperties {
  id: UserId;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  email: Email;
  passwordHash: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly id: UserId;
  private firstname: string;
  private lastname: string;
  private phoneNumber: string;
  private email: Email;
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
      email: this.email,
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
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  isAdmin: boolean;
}

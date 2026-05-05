export type UserRole = 'client' | 'personnel' | 'admin';

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  phoneNumber: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  isAdmin: boolean;
}

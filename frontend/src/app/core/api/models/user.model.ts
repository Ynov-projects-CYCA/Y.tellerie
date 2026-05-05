import { AuthRole } from '@core/auth/models';

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  phone: string;
  isActive: boolean;
  roles: AuthRole[];
}

export interface CreateUserPayload {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  phone: string;
  password: string;
  roles: AuthRole[];
  isActive: boolean;
}

export interface UpdateUserPayload {
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  roles?: AuthRole[];
  isActive?: boolean;
}

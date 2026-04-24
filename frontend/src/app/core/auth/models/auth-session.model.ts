export type AuthRole = 'client' | 'personnel';

export interface AuthenticatedUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber?: string;
  phone: string;
  roles: AuthRole[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export interface LoginPayload {
  email: string;
  password: string;
  requiredRole?: AuthRole;
}

export interface RegisterPayload {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  phone: string;
  password: string;
  role: AuthRole;
}

export interface RegisterResponse {
  message: string;
  user: AuthenticatedUser;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export type SessionPersistence = 'local' | 'session';

export interface AuthSession extends AuthResponse {
  persistence: SessionPersistence;
}

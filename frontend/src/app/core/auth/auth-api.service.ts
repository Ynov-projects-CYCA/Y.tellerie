import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
} from './models/auth-session.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly apiClient = inject(ApiClient);

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse, LoginPayload>('/auth/login', payload);
  }

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.apiClient.post<RegisterResponse, RegisterPayload>(
      '/auth/register',
      payload,
    );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<void> {
    return this.apiClient.post<void, ForgotPasswordPayload>(
      '/auth/forgot-password',
      payload,
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.apiClient.post<{ message: string }, { token: string }>(
      '/auth/verify-email',
      { token },
    );
  }

  resetPassword(payload: ResetPasswordPayload): Observable<void> {
    return this.apiClient.post<void, ResetPasswordPayload>(
      '/auth/reset-password',
      payload,
    );
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.apiClient.patch<void, ChangePasswordPayload>(
      '/auth/change-password',
      payload,
    );
  }
}

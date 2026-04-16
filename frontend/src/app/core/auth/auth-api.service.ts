import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from './models/auth-session.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly apiClient = inject(ApiClient);

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse, LoginPayload>('/auth/login', payload);
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse, RegisterPayload>(
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

  resetPassword(payload: ResetPasswordPayload): Observable<void> {
    return this.apiClient.post<void, ResetPasswordPayload>(
      '/auth/reset-password',
      payload,
    );
  }

  logout(refreshToken: string): Observable<void> {
    return this.apiClient.post<void, { refreshToken: string }>('/auth/logout', {
      refreshToken,
    });
  }
}

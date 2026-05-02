import { Injectable } from '@angular/core';
import { AuthenticatedUser } from '@core/auth/models';

@Injectable({ providedIn: 'root' })
export class AuthRedirectService {
  getPostAuthUrl(user: AuthenticatedUser): string {
    return user.roles.includes('personnel') ? '/staff' : '/client';
  }
}

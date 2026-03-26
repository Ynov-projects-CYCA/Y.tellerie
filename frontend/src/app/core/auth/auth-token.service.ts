import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly storageKey = 'ytellerie.access_token';

  getToken(): string | null {
    return this.getStorage()?.getItem(this.storageKey) ?? null;
  }

  setToken(token: string): void {
    this.getStorage()?.setItem(this.storageKey, token);
  }

  clearToken(): void {
    this.getStorage()?.removeItem(this.storageKey);
  }

  private getStorage(): Storage | null {
    return typeof window === 'undefined' ? null : window.localStorage;
  }
}

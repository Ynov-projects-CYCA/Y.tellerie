import { Injectable, signal } from '@angular/core';
import {
  AuthResponse,
  AuthRole,
  AuthSession,
  AuthenticatedUser,
  SessionPersistence,
} from './models/auth-session.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly storageKey = 'ytellerie.auth_session';
  private readonly sessionState = signal<AuthSession | null>(this.restoreSession());

  readonly session = this.sessionState.asReadonly();

  currentSession(): AuthSession | null {
    return this.sessionState();
  }

  currentUser(): AuthenticatedUser | null {
    return this.sessionState()?.user ?? null;
  }

  isAuthenticated(): boolean {
    return this.sessionState() !== null;
  }

  hasRole(role: AuthRole): boolean {
    return this.sessionState()?.user.roles.includes(role) ?? false;
  }

  getAccessToken(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.sessionState()?.refreshToken ?? null;
  }

  startSession(
    response: AuthResponse,
    persistence: SessionPersistence,
  ): AuthSession {
    const session: AuthSession = {
      ...response,
      persistence,
    };

    this.getStorage('local')?.removeItem(this.storageKey);
    this.getStorage('session')?.removeItem(this.storageKey);
    this.getStorage(persistence)?.setItem(this.storageKey, JSON.stringify(session));
    this.sessionState.set(session);

    return session;
  }

  clearSession(): void {
    this.getStorage('local')?.removeItem(this.storageKey);
    this.getStorage('session')?.removeItem(this.storageKey);
    this.sessionState.set(null);
  }

  updateUser(user: AuthenticatedUser): void {
    const current = this.sessionState();
    if (!current) return;

    const updatedSession: AuthSession = {
      ...current,
      user,
    };

    this.getStorage(updatedSession.persistence)?.setItem(
      this.storageKey,
      JSON.stringify(updatedSession),
    );
    this.sessionState.set(updatedSession);
  }

  updateSession(response: AuthResponse): void {
    const current = this.sessionState();
    if (!current) return;

    const updatedSession: AuthSession = {
      ...current,
      ...response,
    };

    this.getStorage(updatedSession.persistence)?.setItem(
      this.storageKey,
      JSON.stringify(updatedSession),
    );
    this.sessionState.set(updatedSession);
  }

  private restoreSession(): AuthSession | null {
    const storages: SessionPersistence[] = ['session', 'local'];

    for (const persistence of storages) {
      const rawValue = this.getStorage(persistence)?.getItem(this.storageKey);
      if (!rawValue) {
        continue;
      }

      try {
        const parsed = JSON.parse(rawValue) as AuthSession;
        if (this.isAuthSession(parsed)) {
          return {
            ...parsed,
            persistence,
          };
        }
      } catch {
        this.getStorage(persistence)?.removeItem(this.storageKey);
      }
    }

    return null;
  }

  private isAuthSession(value: unknown): value is AuthSession {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<AuthSession>;
    return (
      typeof candidate.accessToken === 'string' &&
      typeof candidate.refreshToken === 'string' &&
      candidate.user !== undefined &&
      candidate.user !== null &&
      typeof candidate.user === 'object'
    );
  }

  private getStorage(persistence: SessionPersistence): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return persistence === 'local' ? window.localStorage : window.sessionStorage;
  }
}

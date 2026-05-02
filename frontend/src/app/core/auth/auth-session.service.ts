import { Injectable, signal } from '@angular/core';
import {
  AuthResponse,
  AuthRole,
  AuthSession,
  AuthenticatedUser,
  SessionPersistence,
} from '@core/auth/models';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly storageKey = 'ytellerie.auth_session';
  private readonly sessionState = signal<AuthSession | null>(this.restoreSession());

  readonly session = this.sessionState.asReadonly();

  currentSession(): AuthSession | null {
    this.ensureSessionValidity();
    return this.sessionState();
  }

  currentUser(): AuthenticatedUser | null {
    return this.currentSession()?.user ?? null;
  }

  isAuthenticated(): boolean {
    return this.currentSession() !== null;
  }

  hasRole(role: AuthRole): boolean {
    return this.sessionState()?.user.roles.includes(role) ?? false;
  }

  getAccessToken(): string | null {
    return this.currentSession()?.accessToken ?? null;
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
        // Une session restauree n'est acceptee que si son contrat minimal
        // est intact et si le JWT d'acces n'est pas deja expire.
        if (this.isAuthSession(parsed) && this.isAccessTokenValid(parsed.accessToken)) {
          return {
            ...parsed,
            persistence,
          };
        }

        this.getStorage(persistence)?.removeItem(this.storageKey);
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

  private ensureSessionValidity(): void {
    const session = this.sessionState();
    if (!session) {
      return;
    }

    // La session peut devenir invalide apres l'initialisation du service
    // si l'utilisateur laisse l'application ouverte jusqu'a expiration du JWT.
    if (!this.isAccessTokenValid(session.accessToken)) {
      this.clearSession();
    }
  }

  private isAccessTokenValid(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    const exp = payload?.['exp'];

    if (typeof exp !== 'number') {
      return false;
    }

    return exp * 1000 > Date.now();
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    try {
      // Le payload JWT est encode en base64url, il faut donc le normaliser
      // avant de pouvoir le decoder avec les API navigateur standard.
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '=',
      );
      const decoded = atob(padded);
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private getStorage(persistence: SessionPersistence): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return persistence === 'local' ? window.localStorage : window.sessionStorage;
  }
}

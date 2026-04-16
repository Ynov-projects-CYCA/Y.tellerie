import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthSessionService } from '../../auth/auth-session.service';
import { AppHttpError } from '../models/app-http-error.model';

interface BackendErrorPayload {
  statusCode?: number;
  timestamp?: string;
  path?: string;
  error?: unknown;
  message?: string | string[];
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const authSessionService = inject(AuthSessionService);
  const router = inject(Router, { optional: true });

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const payload = isBackendErrorPayload(error.error) ? error.error : null;

      if (error.status === 401 && shouldInvalidateSession(request.url)) {
        authSessionService.clearSession();
        void router?.navigateByUrl('/connexion');
      }

      return throwError(
        () =>
          new AppHttpError(buildMessage(error.status, payload), {
            statusCode: payload?.statusCode ?? error.status,
            timestamp: payload?.timestamp,
            path: payload?.path ?? request.url,
            details: payload?.error ?? error.error,
          }),
      );
    }),
  );
};

function isBackendErrorPayload(value: unknown): value is BackendErrorPayload {
  return value !== null && typeof value === 'object';
}

function buildMessage(statusCode: number, payload: BackendErrorPayload | null): string {
  if (statusCode === 0) {
    return "Impossible de joindre l'API. Vérifiez l'URL configurée, le backend et le proxy local.";
  }

  const candidate = extractMessage(payload);

  if (candidate) {
    return candidate;
  }

  switch (statusCode) {
  case 0:
    return "Impossible de joindre l'API.";
  case 400:
    return 'La requête est invalide.';
  case 401:
    return 'Votre session est invalide ou a expiré.';
  case 403:
    return "Vous n'avez pas les droits nécessaires pour cette action.";
  case 404:
    return 'La ressource demandée est introuvable.';
  default:
    return statusCode >= 500
      ? 'Le serveur a rencontré une erreur inattendue.'
      : 'La requête a échoué.';
  }
}

function extractMessage(payload: BackendErrorPayload | null): string | null {
  if (!payload) {
    return null;
  }

  const rawCandidates = [payload.message, payload.error];

  for (const candidate of rawCandidates) {
    const normalized = normalizeMessage(candidate);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function normalizeMessage(candidate: unknown): string | null {
  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }

  if (Array.isArray(candidate)) {
    const messages = candidate
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim());

    return messages.length > 0 ? messages.join(' ') : null;
  }

  if (candidate !== null && typeof candidate === 'object') {
    const nestedCandidate = candidate as { message?: unknown; error?: unknown };
    return normalizeMessage(nestedCandidate.message) ?? normalizeMessage(nestedCandidate.error);
  }

  return null;
}

function shouldInvalidateSession(url: string): boolean {
  return ![
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].some((path) => url.includes(path));
}

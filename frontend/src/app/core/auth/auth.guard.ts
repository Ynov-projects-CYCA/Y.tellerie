import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from './auth-session.service';
import { AuthRedirectService } from './auth-redirect.service';

/**
 * Protège les routes réservées aux utilisateurs connectés.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authSessionService = inject(AuthSessionService);
  const router = inject(Router);

  if (authSessionService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/connexion'], {
    queryParams: { redirectTo: state.url },
  });
};

/**
 * Interdit l'accès aux pages publiques (Home, Login, Register) si déjà connecté.
 */
export const guestGuard: CanActivateFn = () => {
  const authSessionService = inject(AuthSessionService);
  const authRedirectService = inject(AuthRedirectService);
  const router = inject(Router);
  const user = authSessionService.currentUser();

  if (!user) {
    return true;
  }

  // Redirige vers son portail respectif (Client ou Staff)
  return router.createUrlTree([authRedirectService.getPostAuthUrl(user)]);
};

export const clientGuard: CanActivateFn = () => {
  const authSessionService = inject(AuthSessionService);
  const authRedirectService = inject(AuthRedirectService);
  const router = inject(Router);
  const user = authSessionService.currentUser();

  if (user?.roles.includes('client')) {
    return true;
  }

  if (user) {
    return router.createUrlTree([authRedirectService.getPostAuthUrl(user)]);
  }

  return router.createUrlTree(['/connexion']);
};

export const personnelGuard: CanActivateFn = () => {
  const authSessionService = inject(AuthSessionService);
  const authRedirectService = inject(AuthRedirectService);
  const router = inject(Router);
  const user = authSessionService.currentUser();

  if (user?.roles.includes('personnel')) {
    return true;
  }

  if (user) {
    return router.createUrlTree([authRedirectService.getPostAuthUrl(user)]);
  }

  return router.createUrlTree(['/connexion']);
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRole } from '@core/auth/models';
import { AuthRedirectService } from './auth-redirect.service';
import { AuthSessionService } from './auth-session.service';

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
  return roleGuard('client');
};

export const personnelGuard: CanActivateFn = () => {
  return roleGuard('personnel');
};

function roleGuard(role: AuthRole) {
  const authSessionService = inject(AuthSessionService);
  const authRedirectService = inject(AuthRedirectService);
  const router = inject(Router);
  const user = authSessionService.currentUser();

  if (
    user?.roles.includes(role) ||
    (role === 'personnel' && user?.roles.includes('admin'))
  ) {
    return true;
  }

  if (user) {
    // Un utilisateur connecte mais sans le bon role est renvoye
    // vers sa zone naturelle plutot que vers une page d'erreur brute.
    return router.createUrlTree([authRedirectService.getPostAuthUrl(user)]);
  }

  return router.createUrlTree(['/connexion']);
};

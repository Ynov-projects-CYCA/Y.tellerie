import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRole } from './models/auth-session.model';
import { AuthSessionService } from './auth-session.service';
import { AuthRedirectService } from './auth-redirect.service';

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

  if (user?.roles.includes(role)) {
    return true;
  }

  if (user) {
    // Un utilisateur connecte mais sans le bon role est renvoye
    // vers sa zone naturelle plutot que vers une page d'erreur brute.
    return router.createUrlTree([authRedirectService.getPostAuthUrl(user)]);
  }

  return router.createUrlTree(['/connexion']);
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
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

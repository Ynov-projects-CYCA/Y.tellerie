import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '../../auth/auth-token.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authTokenService = inject(AuthTokenService);
  const token = authTokenService.getToken();

  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};

import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthApiService, AuthSessionService } from '@core/auth';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authRefreshInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authSessionService = inject(AuthSessionService);
  const authApiService = inject(AuthApiService);

  return next(request).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !request.url.includes('/auth/login') &&
        !request.url.includes('/auth/refresh')
      ) {
        return handle401Error(request, next, authSessionService, authApiService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  sessionService: AuthSessionService,
  apiService: AuthApiService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = sessionService.getRefreshToken();

    if (refreshToken) {
      return apiService.refresh(refreshToken).pipe(
        switchMap((response) => {
          isRefreshing = false;
          sessionService.startSession(response, sessionService.currentSession()?.persistence ?? 'local');
          refreshTokenSubject.next(response.accessToken);
          
          return next(request.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          }));
        }),
        catchError((err) => {
          isRefreshing = false;
          sessionService.clearSession();
          return throwError(() => err);
        })
      );
    }
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => {
      return next(request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }));
    })
  );
}

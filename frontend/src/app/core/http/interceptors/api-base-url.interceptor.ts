import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_ENVIRONMENT } from '../../config/app-environment';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  const environment = inject(APP_ENVIRONMENT);

  if (!request.url.startsWith('/')) {
    return next(request);
  }

  return next(
    request.clone({
      url: joinUrl(environment.apiBaseUrl, request.url),
    }),
  );
};

function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) {
    return path;
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { APP_ENVIRONMENT } from './core/config/app-environment';
import { apiBaseUrlInterceptor } from './core/http/interceptors/api-base-url.interceptor';
import { apiErrorInterceptor } from './core/http/interceptors/api-error.interceptor';
import { authTokenInterceptor } from './core/http/interceptors/auth-token.interceptor';
import { backendEnvelopeInterceptor } from './core/http/interceptors/backend-envelope.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        apiBaseUrlInterceptor,
        authTokenInterceptor,
        backendEnvelopeInterceptor,
        apiErrorInterceptor,
      ]),
    ),
    {
      provide: APP_ENVIRONMENT,
      useValue: environment,
    },
  ]
};

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { APP_ENVIRONMENT, apiBaseUrlInterceptor, apiErrorInterceptor, authRefreshInterceptor, authTokenInterceptor, backendEnvelopeInterceptor } from '@core';
import { environment } from '@env';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        apiBaseUrlInterceptor,
        authTokenInterceptor,
        authRefreshInterceptor,
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

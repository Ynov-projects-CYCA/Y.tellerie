import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthSessionService } from '../auth/auth-session.service';
import { APP_ENVIRONMENT, AppEnvironment } from '../config/app-environment';
import { ApiClient } from './api-client.service';
import { apiBaseUrlInterceptor } from './interceptors/api-base-url.interceptor';
import { apiErrorInterceptor } from './interceptors/api-error.interceptor';
import { authTokenInterceptor } from './interceptors/auth-token.interceptor';
import { backendEnvelopeInterceptor } from './interceptors/backend-envelope.interceptor';
import { AppHttpError } from './models/app-http-error.model';
import { createJwtToken } from '../../../testing/jwt-test.utils';

describe('ApiClient', () => {
  const environment: AppEnvironment = {
    production: false,
    appName: 'Y.tellerie',
    apiBaseUrl: '/api',
  };

  let apiClient: ApiClient;
  let authSessionService: AuthSessionService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: APP_ENVIRONMENT,
          useValue: environment,
        },
        provideRouter([]),
        provideHttpClient(
          withInterceptors([
            apiBaseUrlInterceptor,
            authTokenInterceptor,
            backendEnvelopeInterceptor,
            apiErrorInterceptor,
          ]),
        ),
        provideHttpClientTesting(),
      ],
    });

    apiClient = TestBed.inject(ApiClient);
    authSessionService = TestBed.inject(AuthSessionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    authSessionService.clearSession();
    httpTestingController.verify();
  });

  it('should prefix the API base URL and unwrap the backend envelope', () => {
    let response: string | undefined;

    apiClient.get<string>('/').subscribe((value) => {
      response = value;
    });

    const request = httpTestingController.expectOne('/api/');
    expect(request.request.headers.has('Authorization')).toBeFalsy();

    request.flush({
      data: 'Hello World!',
      timestamp: '2026-03-24T12:00:00.000Z',
    });

    expect(response).toBe('Hello World!');
  });

  it('should add the bearer token when available', () => {
    authSessionService.startSession(
      {
        accessToken: createJwtToken(),
        refreshToken: 'dummy_refresh_token',
        user: {
          id: 'user-1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          phone: '+33123456789',
          roles: ['client'],
        },
      },
      'local',
    );

    apiClient.get<string>('/profile/client').subscribe();

    const request = httpTestingController.expectOne('/api/profile/client');
    expect(request.request.headers.get('Authorization')).toContain('Bearer ');

    request.flush({
      data: 'ok',
      timestamp: '2026-03-24T12:00:00.000Z',
    });
  });

  it('should convert backend errors into AppHttpError', () => {
    let receivedError: unknown;

    apiClient.get('/rooms').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const request = httpTestingController.expectOne('/api/rooms');

    request.flush(
      {
        statusCode: 400,
        timestamp: '2026-03-24T12:00:00.000Z',
        path: '/rooms',
        error: {
          message: ['number must be a positive integer'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );

    expect(receivedError).toBeInstanceOf(AppHttpError);

    const error = receivedError as AppHttpError;
    expect(error.statusCode).toBe(400);
    expect(error.path).toBe('/rooms');
    expect(error.message).toContain('number must be a positive integer');
  });
});

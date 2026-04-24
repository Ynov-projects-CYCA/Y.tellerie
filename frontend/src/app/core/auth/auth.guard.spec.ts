import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthRedirectService } from './auth-redirect.service';
import { authGuard, clientGuard, personnelGuard } from './auth.guard';
import { AuthSessionService } from './auth-session.service';
import { createJwtToken } from '../../../testing/jwt-test.utils';

describe('auth guards', () => {
  let authSessionService: AuthSessionService;
  let router: Router;

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([]), AuthSessionService, AuthRedirectService],
    });

    authSessionService = TestBed.inject(AuthSessionService);
    router = TestBed.inject(Router);
  });

  it('should redirect unauthenticated users to login with redirectTo', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/client' } as never),
    );

    expect(router.serializeUrl(result as ReturnType<typeof router.createUrlTree>)).toBe(
      '/connexion?redirectTo=%2Fclient',
    );
  });

  it('should reject expired sessions from authGuard', () => {
    authSessionService.startSession(
      {
        accessToken: createJwtToken({}, -60),
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

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/client' } as never),
    );

    expect(authSessionService.currentSession()).toBeNull();
    expect(router.serializeUrl(result as ReturnType<typeof router.createUrlTree>)).toBe(
      '/connexion?redirectTo=%2Fclient',
    );
  });

  it('should allow client users on the client guard', () => {
    authSessionService.startSession(
      {
        accessToken: createJwtToken(),
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

    const result = TestBed.runInInjectionContext(() => clientGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect client users away from the personnel guard', () => {
    authSessionService.startSession(
      {
        accessToken: createJwtToken(),
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

    const result = TestBed.runInInjectionContext(() =>
      personnelGuard({} as never, {} as never),
    );

    expect(router.serializeUrl(result as ReturnType<typeof router.createUrlTree>)).toBe(
      '/client',
    );
  });
});

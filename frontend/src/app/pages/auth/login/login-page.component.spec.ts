import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthRedirectService } from '../../../core/auth/auth-redirect.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { AppHttpError } from '../../../core/http/models/app-http-error.model';
import { createJwtToken } from '../../../../testing/jwt-test.utils';
import { LoginPageComponent } from './login-page.component';

@Component({ standalone: true, template: '' })
class DummyRouteComponent {}

describe('LoginPageComponent', () => {
  const authApiService = {
    login: vi.fn(),
    forgotPassword: vi.fn(),
  };

  beforeEach(async () => {
    authApiService.login.mockReset();
    authApiService.forgotPassword.mockReset();

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([
          { path: 'connexion', component: DummyRouteComponent },
          { path: 'client', component: DummyRouteComponent },
          { path: 'staff', component: DummyRouteComponent },
        ]),
        AuthSessionService,
        AuthRedirectService,
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should create a session and navigate after login success', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;
    const authSessionService = TestBed.inject(AuthSessionService);
    const router = TestBed.inject(Router);
    const startSessionSpy = vi.spyOn(authSessionService, 'startSession');
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    authApiService.login.mockReturnValue(
      of({
        accessToken: createJwtToken(),
        user: {
          id: 'user-1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          phone: '+33123456789',
          roles: ['client'],
        },
      }),
    );

    component['loginForm'].setValue({
      email: 'john.doe@example.com',
      password: 'password123',
      rememberMe: true,
    });

    component['submit']();

    expect(startSessionSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/client');
  });

  it('should expose a specific invalid-credentials error on 401', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;

    authApiService.login.mockReturnValue(
      throwError(
        () =>
          new AppHttpError('Invalid email or password.', {
            statusCode: 401,
          }),
      ),
    );

    component['loginForm'].setValue({
      email: 'john.doe@example.com',
      password: 'wrong-password',
      rememberMe: false,
    });

    component['submit']();

    expect(component['submitError']()).toContain('Identifiants invalides');
  });

  it('should show a generic success message in forgot password flow', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;

    authApiService.forgotPassword.mockReturnValue(of(void 0));

    component['openForgotPasswordModal']();
    component['forgotPasswordForm'].controls.email.setValue('john.doe@example.com');
    component['submitForgotPassword']();

    expect(component['forgotPasswordSuccess']()).toContain('Si un compte existe');
  });

  it('should show the admin contact modal for personnel access requests', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;

    component['selectRole']('personnel');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      "Besoin d'un acces ?",
    );

    component['openAdminContactModal']();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Appelez au 06 67 67 67 67 et dite le code MSEMEN.',
    );
  });
});

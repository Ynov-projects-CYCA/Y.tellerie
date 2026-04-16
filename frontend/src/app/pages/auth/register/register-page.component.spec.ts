import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthRedirectService } from '../../../core/auth/auth-redirect.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { AppHttpError } from '../../../core/http/models/app-http-error.model';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  const authApiService = {
    register: vi.fn(),
  };

  beforeEach(async () => {
    authApiService.register.mockReset();

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideRouter([]),
        AuthSessionService,
        AuthRedirectService,
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
      ],
    }).compileComponents();
  });

  it('should block submission while the form is invalid', () => {
    const fixture = TestBed.createComponent(RegisterPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;

    component['submit']();

    expect(authApiService.register).not.toHaveBeenCalled();
  });

  it('should show a duplicate-email error on 409', () => {
    const fixture = TestBed.createComponent(RegisterPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;

    authApiService.register.mockReturnValue(
      throwError(
        () =>
          new AppHttpError('User with this email already exists.', {
            statusCode: 409,
          }),
      ),
    );

    component['registerForm'].setValue({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      phone: '+33123456789',
      password: 'password123',
      confirmPassword: 'password123',
      acceptTerms: true,
    });

    component['submit']();

    expect(component['submitError']()).toContain('Un compte existe deja');
  });

  it('should navigate to the client space after success', () => {
    const fixture = TestBed.createComponent(RegisterPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    authApiService.register.mockReturnValue(
      of({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
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

    component['registerForm'].setValue({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      phone: '+33123456789',
      password: 'password123',
      confirmPassword: 'password123',
      acceptTerms: true,
    });

    component['submit']();

    expect(navigateSpy).toHaveBeenCalledWith('/client');
  });
});

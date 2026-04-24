import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AppHttpError } from '../../../core/http/models/app-http-error.model';
import { RegisterPageComponent } from './register-page.component';

@Component({ standalone: true, template: '' })
class DummyRouteComponent {}

describe('RegisterPageComponent', () => {
  const authApiService = {
    register: vi.fn(),
  };

  beforeEach(async () => {
    authApiService.register.mockReset();

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideRouter([
          { path: 'connexion', component: DummyRouteComponent },
          { path: 'client', component: DummyRouteComponent },
        ]),
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

  it('should send phoneNumber in the registration payload', () => {
    const fixture = TestBed.createComponent(RegisterPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;

    authApiService.register.mockReturnValue(
      of({
        message: 'Account created. Verify your email before logging in.',
        user: {
          id: 'user-1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+33123456789',
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

    expect(authApiService.register).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '+33123456789',
        phoneNumber: '+33123456789',
      }),
    );
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

  it('should redirect to login after success', () => {
    const fixture = TestBed.createComponent(RegisterPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    authApiService.register.mockReturnValue(
      of({
        message: 'Account created. Verify your email before logging in.',
        user: {
          id: 'user-1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+33123456789',
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

    expect(navigateSpy).toHaveBeenCalledWith('/connexion');
  });
});

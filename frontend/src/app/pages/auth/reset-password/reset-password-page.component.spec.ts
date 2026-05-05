import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AppHttpError, AuthApiService } from '@core';
import { ResetPasswordPageComponent } from './reset-password-page.component';

@Component({ standalone: true, template: '' })
class DummyRouteComponent {}

describe('ResetPasswordPageComponent', () => {
  const authApiService = {
    resetPassword: vi.fn(),
  };

  beforeEach(async () => {
    authApiService.resetPassword.mockReset();

    await TestBed.configureTestingModule({
      imports: [ResetPasswordPageComponent],
      providers: [
        provideRouter([{ path: 'connexion', component: DummyRouteComponent }]),
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ token: 'valid-token' }),
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should set success state after a valid reset and redirect after 3 seconds', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(ResetPasswordPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    authApiService.resetPassword.mockReturnValue(of(void 0));

    component['resetPasswordForm'].setValue({
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    component['submit']();

    expect(component['isSuccess']()).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);

    expect(navigateSpy).toHaveBeenCalledWith('/connexion');
    vi.useRealTimers();
  });

  it('should show an invalid-token error on 401', () => {
    const fixture = TestBed.createComponent(ResetPasswordPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;

    authApiService.resetPassword.mockReturnValue(
      throwError(
        () =>
          new AppHttpError('Invalid or expired password reset token.', {
            statusCode: 401,
          }),
      ),
    );

    component['resetPasswordForm'].setValue({
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    component['submit']();

    expect(component['submitError']()).toContain('invalide ou expire');
  });
});

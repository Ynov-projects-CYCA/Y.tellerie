import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AppHttpError, AuthApiService } from '@core';
import { VerifyEmailPageComponent } from './verify-email-page.component';

@Component({ standalone: true, template: '' })
class DummyRouteComponent {}

describe('VerifyEmailPageComponent', () => {
  const authApiService = {
    verifyEmail: vi.fn(),
  };

  beforeEach(async () => {
    authApiService.verifyEmail.mockReset();

    await TestBed.configureTestingModule({
      imports: [VerifyEmailPageComponent],
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
              queryParamMap: convertToParamMap({ token: 'verify-token' }),
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should verify the token and redirect to login after success', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(VerifyEmailPageComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    authApiService.verifyEmail.mockReturnValue(
      of({ message: 'Email verified successfully.' }),
    );

    fixture.detectChanges();
    vi.runAllTimers();

    expect(authApiService.verifyEmail).toHaveBeenCalledWith('verify-token');
    expect(navigateSpy).toHaveBeenCalledWith('/connexion');
    vi.useRealTimers();
  });

  it('should expose a specific message on invalid token', () => {
    const fixture = TestBed.createComponent(VerifyEmailPageComponent);
    const component = fixture.componentInstance as unknown as Record<string, any>;
    authApiService.verifyEmail.mockReturnValue(
      throwError(
        () =>
          new AppHttpError('Invalid verification token.', {
            statusCode: 400,
          }),
      ),
    );

    fixture.detectChanges();

    expect(component['submitError']()).toContain('lien de verification');
  });
});

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AppHttpError, AuthAccountService, AuthApiService, AuthSessionService } from '@core';
import { createJwtToken } from '@testing';
import { AccountPanelComponent } from './account-panel.component';

describe('AccountPanelComponent', () => {
  const authApiService = {
    changePassword: vi.fn(),
  };

  const authAccountService = {
    logout: vi.fn(),
  };

  beforeEach(async () => {
    authApiService.changePassword.mockReset();
    authAccountService.logout.mockReset();
    authAccountService.logout.mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [AccountPanelComponent],
      providers: [
        AuthSessionService,
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
        {
          provide: AuthAccountService,
          useValue: authAccountService,
        },
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(AccountPanelComponent);
    const authSessionService = TestBed.inject(AuthSessionService);

    authSessionService.startSession(
      {
        accessToken: createJwtToken(),
        refreshToken: 'refresh-token',
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

    fixture.componentRef.setInput('heading', 'Bienvenue');
    fixture.componentRef.setInput('accountTypeLabel', 'Espace client');
    fixture.detectChanges();

    return fixture;
  }

  it('should render the authenticated account information', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.textContent).toContain('John Doe');
    expect(fixture.nativeElement.textContent).toContain('john.doe@example.com');
    expect(fixture.nativeElement.textContent).toContain('client');
    expect(fixture.nativeElement.textContent).toContain(
      "Les endpoints de profil metier restent fictifs",
    );
  });

  it('should call change-password when the form is valid', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance as unknown as Record<string, any>;

    authApiService.changePassword.mockReturnValue(of(void 0));

    component['changePasswordForm'].setValue({
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    component['submitPasswordChange']();

    expect(authApiService.changePassword).toHaveBeenCalledWith({
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    });
    expect(component['passwordSuccess']()).toContain('mot de passe');
  });

  it('should expose backend errors in the password form', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance as unknown as Record<string, any>;

    authApiService.changePassword.mockReturnValue(
      throwError(
        () =>
          new AppHttpError('The old password does not match.', {
            statusCode: 401,
          }),
      ),
    );

    component['changePasswordForm'].setValue({
      oldPassword: 'wrong-password',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    component['submitPasswordChange']();

    expect(component['passwordError']()).toContain('old password');
  });

  it('should centralize logout through the account service', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance as unknown as Record<string, any>;

    component['logout']();

    expect(authAccountService.logout).toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { createJwtToken } from '../../../../testing/jwt-test.utils';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  const authApiService = {
    logout: vi.fn(),
  };

  beforeEach(async () => {
    authApiService.logout.mockReset();
    authApiService.logout.mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        AuthSessionService,
        {
          provide: AuthApiService,
          useValue: authApiService,
        },
      ],
    }).compileComponents();
  });

  function createComponent(roles: Array<'client' | 'personnel'>) {
    const fixture = TestBed.createComponent(NavbarComponent);
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
          roles,
        },
      },
      'local',
    );

    fixture.detectChanges();
    return fixture;
  }

  it('should expose the client dashboard link for client users', () => {
    const fixture = createComponent(['client']);

    expect(fixture.nativeElement.textContent).toContain('Espace Client');
  });

  it('should expose the personnel dashboard link for personnel users', () => {
    const fixture = createComponent(['personnel']);

    expect(fixture.nativeElement.textContent).toContain('Espace Personnel');
  });

  it('should delegate logout to the api service', () => {
    const fixture = createComponent(['client']);
    const component = fixture.componentInstance as unknown as Record<string, any>;

    component['logout']();

    expect(authApiService.logout).toHaveBeenCalled();
  });
});

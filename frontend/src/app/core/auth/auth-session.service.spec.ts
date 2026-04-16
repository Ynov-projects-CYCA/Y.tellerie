import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should persist a remembered session in localStorage', () => {
    const service = new AuthSessionService();

    service.startSession(
      {
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
      },
      'local',
    );

    const restoredService = new AuthSessionService();
    expect(restoredService.getAccessToken()).toBe('access-token');
    expect(window.localStorage.getItem('ytellerie.auth_session')).toContain(
      'access-token',
    );
  });

  it('should persist a temporary session in sessionStorage', () => {
    const service = new AuthSessionService();

    service.startSession(
      {
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
      },
      'session',
    );

    const restoredService = new AuthSessionService();
    expect(restoredService.currentSession()?.persistence).toBe('session');
    expect(window.sessionStorage.getItem('ytellerie.auth_session')).toContain(
      'refresh-token',
    );
  });

  it('should clear both storages', () => {
    const service = new AuthSessionService();

    service.startSession(
      {
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
      },
      'local',
    );

    service.clearSession();

    expect(service.currentSession()).toBeNull();
    expect(window.localStorage.getItem('ytellerie.auth_session')).toBeNull();
    expect(window.sessionStorage.getItem('ytellerie.auth_session')).toBeNull();
  });
});

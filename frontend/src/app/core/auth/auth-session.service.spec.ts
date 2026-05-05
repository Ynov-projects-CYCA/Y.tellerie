import { AuthSessionService } from '@core';
import { createJwtToken } from '@testing';

describe('AuthSessionService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should persist a remembered session in localStorage', () => {
    const service = new AuthSessionService();

    service.startSession(
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

    const restoredService = new AuthSessionService();
    expect(restoredService.getAccessToken()).toBeTruthy();
    expect(window.localStorage.getItem('ytellerie.auth_session')).toContain(
      'accessToken',
    );
  });

  it('should persist a temporary session in sessionStorage', () => {
    const service = new AuthSessionService();

    service.startSession(
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
      'session',
    );

    const restoredService = new AuthSessionService();
    expect(restoredService.currentSession()?.persistence).toBe('session');
    expect(window.sessionStorage.getItem('ytellerie.auth_session')).toContain(
      'accessToken',
    );
  });

  it('should clear both storages', () => {
    const service = new AuthSessionService();

    service.startSession(
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

    service.clearSession();

    expect(service.currentSession()).toBeNull();
    expect(window.localStorage.getItem('ytellerie.auth_session')).toBeNull();
    expect(window.sessionStorage.getItem('ytellerie.auth_session')).toBeNull();
  });

  it('should discard an expired session restored from storage', () => {
    window.localStorage.setItem(
      'ytellerie.auth_session',
      JSON.stringify({
        accessToken: createJwtToken({}, -60),
        refreshToken: 'dummy_refresh_token',
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

    const service = new AuthSessionService();

    expect(service.currentSession()).toBeNull();
    expect(window.localStorage.getItem('ytellerie.auth_session')).toBeNull();
  });

  it('should discard an invalid session restored from storage', () => {
    window.localStorage.setItem(
      'ytellerie.auth_session',
      JSON.stringify({
        accessToken: 'not-a-jwt',
        refreshToken: 'dummy_refresh_token',
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

    const service = new AuthSessionService();

    expect(service.isAuthenticated()).toBe(false);
    expect(window.localStorage.getItem('ytellerie.auth_session')).toBeNull();
  });
});

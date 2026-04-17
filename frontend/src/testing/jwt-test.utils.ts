export function createJwtToken(
  payload: Record<string, unknown> = {},
  expiresInSeconds = 3600,
): string {
  const header = encodeSegment({ alg: 'HS256', typ: 'JWT' });
  const body = encodeSegment({
    sub: 'user-1',
    email: 'john.doe@example.com',
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    ...payload,
  });

  return `${header}.${body}.signature`;
}

function encodeSegment(value: Record<string, unknown>): string {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

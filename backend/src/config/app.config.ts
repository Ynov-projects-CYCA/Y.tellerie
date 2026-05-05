import { registerAs } from '@nestjs/config';
import { getOptionalFrontendBaseUrl } from './frontend-url';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiBaseUrl: process.env.API_BASE_URL?.trim() || undefined,
  corsOrigins: parseCorsOrigins(process.env.CORS_ALLOWED_ORIGINS),
  frontendUrl: process.env.FRONTEND_URL?.trim() || undefined,
  frontendBaseUrl: getOptionalFrontendBaseUrl(),
  runMigrations: parseBoolean(
    process.env.RUN_MIGRATIONS,
    (process.env.NODE_ENV ?? 'development') !== 'production',
  ),
}));

function parseCorsOrigins(rawOrigins?: string): string[] {
  if (!rawOrigins) {
    return [getOptionalFrontendBaseUrl()].filter(Boolean) as string[];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
}

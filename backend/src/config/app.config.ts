import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigins: parseCorsOrigins(process.env.CORS_ALLOWED_ORIGINS),
  frontendUrl: process.env.FRONTEND_URL?.trim() || undefined,
  runMigrations: parseBoolean(
    process.env.RUN_MIGRATIONS,
    (process.env.NODE_ENV ?? 'development') !== 'production',
  ),
}));

function parseCorsOrigins(rawOrigins?: string): string[] {
  if (!rawOrigins) {
    return ['http://localhost:4200', 'http://localhost:3000'];
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

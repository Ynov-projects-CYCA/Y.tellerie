import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigins: parseCorsOrigins(process.env.CORS_ALLOWED_ORIGINS),
  frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? 'http://localhost:4200',
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

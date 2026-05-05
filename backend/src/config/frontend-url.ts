import { ConfigService } from '@nestjs/config';

const LOCAL_FRONTEND_BASE_URL = 'http://localhost:4200';

export function getFrontendBaseUrl(configService?: ConfigService): string {
  const configuredUrl = getOptionalFrontendBaseUrl(configService);

  if (configuredUrl) {
    return configuredUrl;
  }

  if ((process.env.NODE_ENV ?? 'development') !== 'production') {
    return LOCAL_FRONTEND_BASE_URL;
  }

  throw new Error('Missing FRONTEND_BASE_URL or FRONTEND_URL');
}

export function getOptionalFrontendBaseUrl(configService?: ConfigService): string | undefined {
  const configuredUrl =
    configService?.get<string>('app.frontendBaseUrl')?.trim() ||
    configService?.get<string>('app.frontendUrl')?.trim() ||
    process.env.FRONTEND_BASE_URL?.trim() ||
    process.env.FRONTEND_URL?.trim();

  return configuredUrl?.replace(/\/$/, '');
}

export function buildFrontendUrl(path: string, configService?: ConfigService): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${getFrontendBaseUrl(configService)}${normalizedPath}`;
}

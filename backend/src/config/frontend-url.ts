import { ConfigService } from '@nestjs/config';

export function getFrontendBaseUrl(configService?: ConfigService): string {
  const configuredUrl = getOptionalFrontendBaseUrl(configService);

  if (!configuredUrl) {
    throw new Error('Missing FRONTEND_BASE_URL or FRONTEND_URL');
  }

  return configuredUrl;
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

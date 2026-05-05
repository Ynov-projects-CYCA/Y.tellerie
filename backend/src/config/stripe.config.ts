import { registerAs } from '@nestjs/config';
import { buildFrontendUrl, getOptionalFrontendBaseUrl } from './frontend-url';

const hasFrontendBaseUrl = Boolean(getOptionalFrontendBaseUrl());

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY ?? '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  currency: process.env.STRIPE_DEFAULT_CURRENCY ?? 'usd',
  successUrl:
    process.env.STRIPE_SUCCESS_URL?.trim() ||
    (hasFrontendBaseUrl
      ? buildFrontendUrl('/client/paiement/success')
      : undefined),
  cancelUrl:
    process.env.STRIPE_CANCEL_URL?.trim() ||
    (hasFrontendBaseUrl
      ? buildFrontendUrl('/client/paiement/cancel')
      : undefined),
}));

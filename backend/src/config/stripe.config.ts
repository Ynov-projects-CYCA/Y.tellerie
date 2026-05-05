import { registerAs } from '@nestjs/config';
import { buildFrontendUrl } from './frontend-url';

export default registerAs('stripe', () => {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    currency: process.env.STRIPE_DEFAULT_CURRENCY ?? 'usd',
    successUrl:
      process.env.STRIPE_SUCCESS_URL?.trim() ||
      buildFrontendUrl('/client/paiement/success'),
    cancelUrl:
      process.env.STRIPE_CANCEL_URL?.trim() ||
      buildFrontendUrl('/client/paiement/cancel'),
  };
});

import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY ?? '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  currency: process.env.STRIPE_DEFAULT_CURRENCY ?? 'usd',
  successUrl: process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:3000/success',
  cancelUrl: process.env.STRIPE_CANCEL_URL ?? 'http://localhost:3000/cancel',
}));

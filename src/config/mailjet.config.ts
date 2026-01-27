import { registerAs } from '@nestjs/config';

export default registerAs('mailjet', () => ({
  apiKey: process.env.MAILJET_API_KEY ?? '',
  apiSecret: process.env.MAILJET_API_SECRET ?? '',
  sandboxMode: (process.env.MAILJET_SANDBOX ?? 'false') === 'true',
  defaultSenderEmail: process.env.MAILJET_SENDER_EMAIL ?? '',
  defaultSenderName: process.env.MAILJET_SENDER_NAME ?? 'Archi Hotel',
}));

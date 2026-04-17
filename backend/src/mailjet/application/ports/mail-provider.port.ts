import { EmailMessage } from '@/mailjet/domain/email-message.entity';

export const IMailProvider = Symbol('IMailProvider');

export interface IMailProvider {
  sendEmail(message: EmailMessage): Promise<{ messageId: string }>;
}


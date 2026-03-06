import { Inject, Injectable } from '@nestjs/common';
import { EmailMessage } from '../../domain/email-message.entity';
import {
  IMailProvider,
  IMailProvider as IMailProviderSymbol,
} from '../ports/mail-provider.port';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendTransactionalEmailUseCase {
  constructor(
    @Inject(IMailProviderSymbol)
    private readonly mailProvider: IMailProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: {
    to: { email: string; name?: string };
    subject: string;
    text?: string;
    html?: string;
    variables?: Record<string, string | number | boolean>;
  }): Promise<{ messageId: string }> {
    const fromEmail =
      this.configService.get<string>('mailjet.defaultSenderEmail') ?? '';
    const fromName =
      this.configService.get<string>('mailjet.defaultSenderName') ??
      'Archi Hotel';

    const message = EmailMessage.create({
      from: { email: fromEmail, name: fromName },
      to: { email: command.to.email, name: command.to.name },
      subject: command.subject,
      text: command.text,
      html: command.html,
      variables: command.variables,
    });

    return this.mailProvider.sendEmail(message);
  }
}


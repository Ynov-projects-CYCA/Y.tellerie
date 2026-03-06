import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// node-mailjet typings do not expose apiConnect properly; use `any` to access it safely.
// Using require because node-mailjet CommonJS export breaks with ESM default import in runtime
const Mailjet: any = require('node-mailjet');
import { IMailProvider } from '../../application/ports/mail-provider.port';
import { EmailMessage } from '../../domain/email-message.entity';

@Injectable()
export class MailjetProvider implements IMailProvider {
  private readonly client: any;
  private readonly logger = new Logger(MailjetProvider.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('mailjet.apiKey');
    const apiSecret = this.configService.get<string>('mailjet.apiSecret');

    if (!apiKey || !apiSecret) {
      throw new Error('Missing Mailjet API credentials');
    }

    // Cast to any because type definitions miss apiConnect
    this.client = Mailjet.apiConnect(apiKey, apiSecret);
  }

  async sendEmail(message: EmailMessage): Promise<{ messageId: string }> {
    const props = message.getProperties();
    try {
      const response = await this.client
        .post('send', { version: 'v3.1' })
        .request({
          SandboxMode: this.configService.get<boolean>('mailjet.sandboxMode'),
          Messages: [
            {
              From: {
                Email: props.from.email,
                Name: props.from.name,
              },
              To: [
                {
                  Email: props.to.email,
                  Name: props.to.name,
                },
              ],
              Subject: props.subject,
              TextPart: props.text,
              HTMLPart: props.html,
              Variables: props.variables,
            },
          ],
        });

      const body: any = response.body;
      const firstMessage = body?.Messages?.[0];
      const status: string | undefined = firstMessage?.Status;

      if (status !== 'success') {
        const errors = firstMessage?.Errors ?? body?.Messages;
        this.logger.error(
          `Mailjet send failed (status=${status ?? 'unknown'}) for ${
            props.to.email
          }`,
          JSON.stringify(errors),
        );
        throw new Error(
          `Mailjet send failed with status ${status ?? 'unknown'}`,
        );
      }

      const messageId =
        firstMessage?.To?.[0]?.MessageUUID ??
        firstMessage?.To?.[0]?.MessageID;

      this.logger.log(
        `Mailjet message sent to ${props.to.email} (status=${status}, id=${
          messageId ?? 'n/a'
        })`,
      );
      this.logger.debug(`Mailjet raw response: ${JSON.stringify(body)}`);

      // Some sandbox/blocked scenarios may not return MessageID; do not fail hard.
      return { messageId: String(messageId ?? 'unknown') };
    } catch (error) {
      this.logger.error(
        `Mailjet send failed for ${props.to.email}`,
        (error as any)?.message,
      );
      // Re-throw to bubble up to controller
      throw error;
    }
  }
}

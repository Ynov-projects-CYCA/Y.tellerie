export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailMessageProps {
  from: EmailRecipient;
  to: EmailRecipient;
  subject: string;
  text?: string;
  html?: string;
  variables?: Record<string, string | number | boolean>;
}

export class EmailMessage {
  private constructor(private readonly props: EmailMessageProps) {}

  static create(props: EmailMessageProps): EmailMessage {
    if (!props.to.email) {
      throw new Error('Recipient email is required');
    }
    if (!props.from.email) {
      throw new Error('Sender email is required');
    }
    if (!props.subject) {
      throw new Error('Subject is required');
    }
    return new EmailMessage(props);
  }

  getProperties(): EmailMessageProps {
    return this.props;
  }
}


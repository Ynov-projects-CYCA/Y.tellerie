import { ConfigService } from '@nestjs/config';
import { EmailMessage } from '../../domain/email-message.entity';
import { MailjetProvider } from './mailjet.provider';

// Define mocks first, then declare factory for jest.mock to avoid TDZ issues.
const sendMock = jest.fn();
const postMock = jest.fn().mockReturnValue({ request: sendMock });
const apiConnectMock = jest.fn(() => ({ post: postMock }));

jest.mock('node-mailjet', () => ({
  apiConnect: (...args: unknown[]) => apiConnectMock.apply(null, args as any),
}));

const configStub = {
  get: (key: string) => {
    if (key === 'mailjet.apiKey') return 'key';
    if (key === 'mailjet.apiSecret') return 'secret';
    if (key === 'mailjet.sandboxMode') return false;
    if (key === 'mailjet.defaultSenderEmail') return 'no-reply@test.com';
    if (key === 'mailjet.defaultSenderName') return 'Tester';
    return undefined;
  },
} as unknown as ConfigService;

describe('MailjetProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends email and returns messageId on success', async () => {
    sendMock.mockResolvedValue({
      body: {
        Messages: [
          {
            Status: 'success',
            To: [{ MessageUUID: 'uuid-123', Email: 'dest@test.com' }],
          },
        ],
      },
    });

    const provider = new MailjetProvider(configStub);
    const email = EmailMessage.create({
      from: { email: 'no-reply@test.com', name: 'Tester' },
      to: { email: 'dest@test.com', name: 'Dest' },
      subject: 'Hello',
      text: 'Hi',
    });

    const res = await provider.sendEmail(email);

    expect(apiConnectMock).toHaveBeenCalledWith('key', 'secret');
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(res.messageId).toBe('uuid-123');
  });

  it('returns unknown messageId if Mailjet response lacks IDs', async () => {
    sendMock.mockResolvedValue({
      body: {
        Messages: [
          { Status: 'success', To: [{ Email: 'dest@test.com' }] },
        ],
      },
    });

    const provider = new MailjetProvider(configStub);
    const email = EmailMessage.create({
      from: { email: 'no-reply@test.com' },
      to: { email: 'dest@test.com' },
      subject: 'Hello',
    });

    const res = await provider.sendEmail(email);

    expect(res.messageId).toBe('unknown');
  });

  it('throws when Mailjet status is not success', async () => {
    sendMock.mockResolvedValue({
      body: {
        Messages: [
          { Status: 'error', Errors: [{ ErrorMessage: 'Invalid sender' }] },
        ],
      },
    });

    const provider = new MailjetProvider(configStub);
    const email = EmailMessage.create({
      from: { email: 'no-reply@test.com' },
      to: { email: 'dest@test.com' },
      subject: 'Hello',
    });

    await expect(provider.sendEmail(email)).rejects.toThrow(
      /Mailjet send failed/,
    );
  });
});

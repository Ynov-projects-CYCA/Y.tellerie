import { SendTransactionalEmailUseCase } from './send-transactional-email.use-case';
import {
  IMailProvider,
  IMailProvider as IMailProviderSymbol,
} from '../ports/mail-provider.port';
import { ConfigService } from '@nestjs/config';

describe('SendTransactionalEmailUseCase', () => {
  const mailProviderMock: jest.Mocked<IMailProvider> = {
    sendEmail: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn((key: string) => {
      if (key === 'mailjet.defaultSenderEmail') return 'no-reply@example.com';
      if (key === 'mailjet.defaultSenderName') return 'Test Sender';
      return undefined;
    }),
  } as unknown as ConfigService;

  let useCase: SendTransactionalEmailUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SendTransactionalEmailUseCase(
      mailProviderMock,
      configServiceMock,
    );
  });

  it('should call provider with composed email and return messageId', async () => {
    mailProviderMock.sendEmail.mockResolvedValue({ messageId: '123' });

    const result = await useCase.execute({
      to: { email: 'client@example.com', name: 'Client' },
      subject: 'Hello',
      text: 'Hi there',
      html: '<p>Hi there</p>',
      variables: { name: 'Client' },
    });

    expect(result).toEqual({ messageId: '123' });
    expect(mailProviderMock.sendEmail).toHaveBeenCalledTimes(1);
    const emailArg = mailProviderMock.sendEmail.mock.calls[0][0];
    expect(emailArg.getProperties().to.email).toBe('client@example.com');
    expect(emailArg.getProperties().from.email).toBe('no-reply@example.com');
    expect(emailArg.getProperties().subject).toBe('Hello');
  });
});


import { HandleWebhookUseCase } from './handle-webhook.use-case';
import {
  IPaymentProvider,
  IPaymentProvider as IPaymentProviderSymbol,
} from '../ports/payment-provider.port';

describe('HandleWebhookUseCase', () => {
  const paymentProviderMock: jest.Mocked<IPaymentProvider> = {
    createCheckoutSession: jest.fn(),
    retrieveEvent: jest.fn(),
  };

  let useCase: HandleWebhookUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new HandleWebhookUseCase(paymentProviderMock);
  });

  it('should validate the event through the provider and acknowledge reception', async () => {
    paymentProviderMock.retrieveEvent.mockResolvedValue({
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123', amount_total: 1999, currency: 'usd' } },
    } as any);

    const res = await useCase.execute(Buffer.from('{}'), 'signature');

    expect(paymentProviderMock.retrieveEvent).toHaveBeenCalledWith(
      'signature',
      expect.any(Buffer),
    );
    expect(res).toEqual({ received: true });
  });
});


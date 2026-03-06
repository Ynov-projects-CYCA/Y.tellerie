import { CreateCheckoutSessionUseCase } from './create-checkout-session.use-case';
import {
  IPaymentProvider,
  IPaymentProvider as IPaymentProviderSymbol,
} from '../ports/payment-provider.port';

describe('CreateCheckoutSessionUseCase', () => {
  const paymentProviderMock: jest.Mocked<IPaymentProvider> = {
    createCheckoutSession: jest.fn(),
    retrieveEvent: jest.fn(),
  };

  let useCase: CreateCheckoutSessionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateCheckoutSessionUseCase(paymentProviderMock);
  });

  it('should create a checkout session with the provider and return its identifiers', async () => {
    paymentProviderMock.createCheckoutSession.mockResolvedValue({
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    const result = await useCase.execute({
      amount: 1999,
      currency: 'usd',
      description: 'Réservation chambre deluxe',
      customerEmail: 'client@example.com',
    });

    expect(result).toEqual({
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    expect(paymentProviderMock.createCheckoutSession).toHaveBeenCalledTimes(1);
    const paymentArg = paymentProviderMock.createCheckoutSession.mock.calls[0][0];
    const props = paymentArg.getProperties();
    expect(props.amount.getAmount()).toBe(1999);
    expect(props.amount.getCurrency()).toBe('usd');
    expect(props.description).toBe('Réservation chambre deluxe');
    expect(props.customerEmail).toBe('client@example.com');
    expect(props.status).toBe('pending');
  });
});


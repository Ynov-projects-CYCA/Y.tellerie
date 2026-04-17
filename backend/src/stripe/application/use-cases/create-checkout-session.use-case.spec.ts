import { CreateCheckoutSessionUseCase } from './create-checkout-session.use-case';
import { BookingFactory } from '../../../bookings/domain/booking.factory';
import {
  IPaymentProvider,
} from '../ports/payment-provider.port';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';

describe('CreateCheckoutSessionUseCase', () => {
  const paymentProviderMock: jest.Mocked<IPaymentProvider> = {
    createCheckoutSession: jest.fn(),
    retrieveEvent: jest.fn(),
  };
  const paymentRepositoryMock: jest.Mocked<PaymentRepositoryPort> = {
    save: jest.fn(),
    findById: jest.fn(),
    findByCheckoutSessionId: jest.fn(),
    findLatestByBookingId: jest.fn(),
  };
  const bookingRepositoryMock = {
    findById: jest.fn(),
  };

  let useCase: CreateCheckoutSessionUseCase;
  let bookingFactory: BookingFactory;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingFactory = new BookingFactory();
    useCase = new CreateCheckoutSessionUseCase(
      paymentProviderMock,
      paymentRepositoryMock,
      bookingRepositoryMock as any,
    );
  });

  it('should create a checkout session with the provider and return its identifiers', async () => {
    const booking = bookingFactory.createBooking(
      'room-123',
      'Ada',
      'Lovelace',
      'ada@example.com',
      new Date('2026-04-10T00:00:00.000Z'),
      new Date('2026-04-12T00:00:00.000Z'),
      2,
      399.99,
      'EUR',
    );
    bookingRepositoryMock.findById.mockResolvedValue(booking);
    paymentRepositoryMock.save.mockImplementation(async (payment) => payment);
    paymentProviderMock.createCheckoutSession.mockResolvedValue({
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    const result = await useCase.execute({
      bookingId: booking.getId(),
      description: 'Réservation chambre deluxe',
    });

    expect(result).toEqual({
      paymentId: expect.any(String),
      bookingId: booking.getId(),
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    expect(bookingRepositoryMock.findById).toHaveBeenCalledWith(booking.getId());
    expect(paymentRepositoryMock.save).toHaveBeenCalledTimes(2);
    expect(paymentProviderMock.createCheckoutSession).toHaveBeenCalledTimes(1);
    const paymentArg = paymentProviderMock.createCheckoutSession.mock.calls[0][0];
    const props = paymentArg.getProperties();
    expect(props.bookingId).toBe(booking.getId());
    expect(props.amount.getAmount()).toBe(39999);
    expect(props.amount.getCurrency()).toBe('eur');
    expect(props.description).toBe('Réservation chambre deluxe');
    expect(props.customerEmail).toBe('ada@example.com');
    expect(props.status).toBe('pending');
  });
});

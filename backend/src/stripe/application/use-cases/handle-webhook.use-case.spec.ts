import { HandleWebhookUseCase } from './handle-webhook.use-case';
import { BookingFactory } from '../../../bookings/domain/booking.factory';
import { Payment } from '../../domain/payment.entity';
import { Money } from '../../domain/money.vo';
import {
  IPaymentProvider,
} from '../ports/payment-provider.port';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';

describe('HandleWebhookUseCase', () => {
  const paymentProviderMock: jest.Mocked<IPaymentProvider> = {
    createCheckoutSession: jest.fn(),
    retrieveEvent: jest.fn(),
    refund: jest.fn(),
  };
  const paymentRepositoryMock: jest.Mocked<PaymentRepositoryPort> = {
    save: jest.fn(),
    findById: jest.fn(),
    findByCheckoutSessionId: jest.fn(),
    findLatestByBookingId: jest.fn(),
  };
  const bookingRepositoryMock = {
    save: jest.fn(),
    findById: jest.fn(),
  };
  const sendMailUseCaseMock = {
    execute: jest.fn().mockResolvedValue({ messageId: '123' }),
  };

  let useCase: HandleWebhookUseCase;
  let bookingFactory: BookingFactory;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_BASE_URL = 'http://frontend.test';
    bookingFactory = new BookingFactory();
    useCase = new HandleWebhookUseCase(
      paymentProviderMock,
      paymentRepositoryMock,
      bookingRepositoryMock as any,
      sendMailUseCaseMock as any,
    );
  });

  it('should mark payment and booking as confirmed when checkout completes', async () => {
    const booking = bookingFactory.createBooking(
      'room-123',
      'Ada',
      'Lovelace',
      'ada@example.com',
      new Date('2026-04-10T00:00:00.000Z'),
      new Date('2026-04-12T00:00:00.000Z'),
      2,
      500,
      'EUR',
    );
    const payment = Payment.create({
      id: 'payment-123',
      bookingId: booking.getId(),
      amount: Money.create(50000, 'EUR'),
      status: 'pending',
      customerEmail: booking.getGuestEmail(),
    });

    paymentProviderMock.retrieveEvent.mockResolvedValue({
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          amount_total: 50000,
          currency: 'eur',
          metadata: { paymentId: 'payment-123' },
        },
      },
    } as any);
    paymentRepositoryMock.findById.mockResolvedValue(payment);
    paymentRepositoryMock.save.mockImplementation(async (savedPayment) => savedPayment);
    bookingRepositoryMock.findById.mockResolvedValue(booking);
    bookingRepositoryMock.save.mockImplementation(async (savedBooking: any) => savedBooking);

    const res = await useCase.execute(Buffer.from('{}'), 'signature');

    expect(paymentProviderMock.retrieveEvent).toHaveBeenCalledWith(
      'signature',
      expect.any(Buffer),
    );
    expect(paymentRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(bookingRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(payment.getProperties().status).toBe('succeeded');
    expect(booking.getStatus().getValue()).toBe('CONFIRMED');
    expect(res).toEqual({ received: true });
  });
});

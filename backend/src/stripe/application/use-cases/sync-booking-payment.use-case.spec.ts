import { BookingFactory } from '@/bookings/domain/booking.factory';
import { Payment } from '@/stripe/domain/payment.entity';
import { Money } from '@/stripe/domain/money.vo';
import { IPaymentProvider } from '../ports/payment-provider.port';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';
import { SyncBookingPaymentUseCase } from './sync-booking-payment.use-case';

describe('SyncBookingPaymentUseCase', () => {
  const paymentProviderMock: jest.Mocked<IPaymentProvider> = {
    createCheckoutSession: jest.fn(),
    retrieveCheckoutSession: jest.fn(),
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

  let useCase: SyncBookingPaymentUseCase;
  let bookingFactory: BookingFactory;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_BASE_URL = 'http://frontend.test';
    bookingFactory = new BookingFactory();
    useCase = new SyncBookingPaymentUseCase(
      paymentProviderMock,
      paymentRepositoryMock,
      bookingRepositoryMock as any,
      sendMailUseCaseMock as any,
    );
  });

  it('should confirm booking when latest checkout session is paid', async () => {
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
    payment.attachCheckoutSession('cs_test_123');

    bookingRepositoryMock.findById.mockResolvedValue(booking);
    paymentRepositoryMock.findLatestByBookingId.mockResolvedValue(payment);
    paymentRepositoryMock.save.mockImplementation(async (savedPayment) => savedPayment);
    bookingRepositoryMock.save.mockImplementation(async (savedBooking: any) => savedBooking);
    paymentProviderMock.retrieveCheckoutSession.mockResolvedValue({
      id: 'cs_test_123',
      payment_status: 'paid',
      payment_intent: 'pi_test_123',
    } as any);

    const result = await useCase.execute(booking.getId());

    expect(paymentProviderMock.retrieveCheckoutSession).toHaveBeenCalledWith('cs_test_123');
    expect(payment.getProperties().status).toBe('succeeded');
    expect(payment.getProperties().paymentIntentId).toBe('pi_test_123');
    expect(booking.getStatus().getValue()).toBe('CONFIRMED');
    expect(result.synced).toBe(true);
    expect(sendMailUseCaseMock.execute).toHaveBeenCalledTimes(1);
  });
});

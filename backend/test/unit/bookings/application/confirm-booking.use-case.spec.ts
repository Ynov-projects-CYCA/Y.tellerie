import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmBookingUseCase } from '../../../../src/bookings/application/use-cases/confirm-booking.use-case';
import { BOOKING_REPOSITORY } from '../../../../src/bookings/application/ports/booking-repository.port';
import { BookingFactory } from '../../../../src/bookings/domain/booking.factory';
import { GetBookingSummaryUseCase } from '../../../../src/bookings/application/use-cases/get-booking-summary.use-case';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';

describe('ConfirmBookingUseCase', () => {
  let useCase: ConfirmBookingUseCase;
  let bookingFactory: BookingFactory;
  let roomFactory: RoomFactory;
  let bookingRepository: any;
  let getBookingSummaryUseCase: any;

  beforeEach(async () => {
    bookingRepository = {
      save: jest.fn(),
    };

    getBookingSummaryUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmBookingUseCase,
        BookingFactory,
        RoomFactory,
        {
          provide: BOOKING_REPOSITORY,
          useValue: bookingRepository,
        },
        {
          provide: GetBookingSummaryUseCase,
          useValue: getBookingSummaryUseCase,
        },
      ],
    }).compile();

    useCase = module.get<ConfirmBookingUseCase>(ConfirmBookingUseCase);
    bookingFactory = module.get<BookingFactory>(BookingFactory);
    roomFactory = module.get<RoomFactory>(RoomFactory);
  });

  it('should confirm and persist a booking', async () => {
    const room = roomFactory.createSuiteRoom('301', 250);
    getBookingSummaryUseCase.execute.mockResolvedValue({
      room,
      guestFirstName: 'Katherine',
      guestLastName: 'Johnson',
      guestEmail: 'kj@example.com',
      checkInDate: new Date('2026-06-10T00:00:00.000Z'),
      checkOutDate: new Date('2026-06-12T00:00:00.000Z'),
      nights: 2,
      totalPrice: 500,
      currency: 'EUR',
      specialRequests: 'Vue mer',
    });

    bookingRepository.save.mockImplementation(async (booking: any) => booking);

    const result = await useCase.execute({
      roomId: room.getId(),
      checkInDate: '2026-06-10',
      checkOutDate: '2026-06-12',
      guestFirstName: 'Katherine',
      guestLastName: 'Johnson',
      guestEmail: 'kj@example.com',
      specialRequests: 'Vue mer',
    });

    expect(bookingRepository.save).toHaveBeenCalledTimes(1);
    expect(result.booking.getRoomId()).toBe(room.getId());
    expect(result.booking.getStatus().getValue()).toBe('PENDING_PAYMENT');
    expect(result.booking.getTotalPrice()).toBe(500);
  });
});

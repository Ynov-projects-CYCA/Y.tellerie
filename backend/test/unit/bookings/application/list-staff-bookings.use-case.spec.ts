import { Test, TestingModule } from '@nestjs/testing';
import { ListStaffBookingsUseCase } from '../../../../src/bookings/application/use-cases/list-staff-bookings.use-case';
import { BOOKING_REPOSITORY } from '../../../../src/bookings/application/ports/booking-repository.port';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { BookingFactory } from '../../../../src/bookings/domain/booking.factory';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';

describe('ListStaffBookingsUseCase', () => {
  let useCase: ListStaffBookingsUseCase;
  let bookingFactory: BookingFactory;
  let roomFactory: RoomFactory;
  let bookingRepository: { findAll: jest.Mock };
  let roomRepository: { findById: jest.Mock };

  beforeEach(async () => {
    bookingRepository = {
      findAll: jest.fn(),
    };

    roomRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListStaffBookingsUseCase,
        BookingFactory,
        RoomFactory,
        {
          provide: BOOKING_REPOSITORY,
          useValue: bookingRepository,
        },
        {
          provide: ROOM_REPOSITORY,
          useValue: roomRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListStaffBookingsUseCase>(ListStaffBookingsUseCase);
    bookingFactory = module.get<BookingFactory>(BookingFactory);
    roomFactory = module.get<RoomFactory>(RoomFactory);
  });

  it('should list every booking with its room for staff users', async () => {
    const room = roomFactory.createDoubleRoom('204', 180);
    const booking = bookingFactory.createBooking(
      room.getId(),
      'Ada',
      'Lovelace',
      'ada@example.com',
      new Date('2026-07-10T00:00:00.000Z'),
      new Date('2026-07-12T00:00:00.000Z'),
      2,
      360,
      'EUR',
    );

    bookingRepository.findAll.mockResolvedValue([booking]);
    roomRepository.findById.mockResolvedValue(room);

    const result = await useCase.execute();

    expect(bookingRepository.findAll).toHaveBeenCalledTimes(1);
    expect(roomRepository.findById).toHaveBeenCalledWith(room.getId());
    expect(result).toEqual([{ booking, room }]);
  });
});

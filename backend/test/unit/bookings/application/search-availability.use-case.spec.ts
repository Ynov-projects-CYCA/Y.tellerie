import { Test, TestingModule } from '@nestjs/testing';
import { SearchAvailabilityUseCase } from '../../../../src/bookings/application/use-cases/search-availability.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { BOOKING_REPOSITORY } from '../../../../src/bookings/application/ports/booking-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';
import { BookingFactory } from '../../../../src/bookings/domain/booking.factory';
import { RoomType } from '../../../../src/rooms/domain/room-type.vo';

describe('SearchAvailabilityUseCase', () => {
  let useCase: SearchAvailabilityUseCase;
  let roomFactory: RoomFactory;
  let bookingFactory: BookingFactory;
  let roomRepository: any;
  let bookingRepository: any;

  beforeEach(async () => {
    roomRepository = {
      findAll: jest.fn(),
    };

    bookingRepository = {
      findOverlapping: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchAvailabilityUseCase,
        RoomFactory,
        BookingFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: roomRepository,
        },
        {
          provide: BOOKING_REPOSITORY,
          useValue: bookingRepository,
        },
      ],
    }).compile();

    useCase = module.get<SearchAvailabilityUseCase>(SearchAvailabilityUseCase);
    roomFactory = module.get<RoomFactory>(RoomFactory);
    bookingFactory = module.get<BookingFactory>(BookingFactory);
  });

  it('should return only reservable rooms for the requested dates', async () => {
    const room101 = roomFactory.createSimpleRoom('101', 100);
    const room102 = roomFactory.createDoubleRoom('102', 150);
    const room103 = roomFactory.createSuiteRoom('103', 320);
    room103.occupy();

    const overlappingBooking = bookingFactory.createBooking(
      room101.getId(),
      'Ada',
      'Lovelace',
      'ada@example.com',
      new Date('2026-04-10T00:00:00.000Z'),
      new Date('2026-04-12T00:00:00.000Z'),
      2,
      200,
      'EUR',
    );

    roomRepository.findAll.mockResolvedValue([room101, room102, room103]);
    bookingRepository.findOverlapping.mockResolvedValue([overlappingBooking]);

    const result = await useCase.execute({
      checkInDate: '2026-04-10',
      checkOutDate: '2026-04-13',
      capacity: 2,
      type: RoomType.DOUBLE,
      maxPrice: 200,
    });

    expect(result).toHaveLength(1);
    expect(result[0].room.getRoomNumber()).toBe('102');
    expect(result[0].nights).toBe(3);
    expect(result[0].totalPrice).toBe(450);
  });
});

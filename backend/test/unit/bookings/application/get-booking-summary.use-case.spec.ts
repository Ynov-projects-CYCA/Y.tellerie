import { Test, TestingModule } from '@nestjs/testing';
import { GetBookingSummaryUseCase } from '../../../../src/bookings/application/use-cases/get-booking-summary.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { BOOKING_REPOSITORY } from '../../../../src/bookings/application/ports/booking-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';
import { ConflictException } from '@nestjs/common';

describe('GetBookingSummaryUseCase', () => {
  let useCase: GetBookingSummaryUseCase;
  let roomFactory: RoomFactory;
  let roomRepository: any;
  let bookingRepository: any;

  beforeEach(async () => {
    roomRepository = {
      findById: jest.fn(),
    };

    bookingRepository = {
      findRoomConflicts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookingSummaryUseCase,
        RoomFactory,
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

    useCase = module.get<GetBookingSummaryUseCase>(GetBookingSummaryUseCase);
    roomFactory = module.get<RoomFactory>(RoomFactory);
  });

  it('should build a reservation summary before confirmation', async () => {
    const room = roomFactory.createDoubleRoom('202', 180);
    roomRepository.findById.mockResolvedValue(room);
    bookingRepository.findRoomConflicts.mockResolvedValue([]);

    const result = await useCase.execute({
      roomId: room.getId(),
      checkInDate: '2026-05-01',
      checkOutDate: '2026-05-04',
      guestFirstName: 'Grace',
      guestLastName: 'Hopper',
      guestEmail: 'grace@example.com',
      specialRequests: 'Lit bébé',
    });

    expect(result.room.getId()).toBe(room.getId());
    expect(result.nights).toBe(3);
    expect(result.totalPrice).toBe(540);
    expect(result.specialRequests).toBe('Lit bébé');
  });

  it('should reject summary when the room is already booked', async () => {
    const room = roomFactory.createDoubleRoom('202', 180);
    roomRepository.findById.mockResolvedValue(room);
    bookingRepository.findRoomConflicts.mockResolvedValue([{}]);

    await expect(
      useCase.execute({
        roomId: room.getId(),
        checkInDate: '2026-05-01',
        checkOutDate: '2026-05-04',
        guestFirstName: 'Grace',
        guestLastName: 'Hopper',
        guestEmail: 'grace@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

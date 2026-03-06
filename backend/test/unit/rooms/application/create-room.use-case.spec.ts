import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoomUseCase } from '../../../../src/rooms/application/use-cases/create-room.use-case';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { RoomType } from '../../../../src/rooms/domain/room-type.vo';
import { ConflictException } from '@nestjs/common';

describe('CreateRoomUseCase', () => {
  let useCase: CreateRoomUseCase;
  let mockRepository: any;
  let factory: RoomFactory;

  beforeEach(async () => {
    mockRepository = {
      exists: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoomUseCase,
        RoomFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateRoomUseCase>(CreateRoomUseCase);
    factory = module.get<RoomFactory>(RoomFactory);
  });

  it('should create a room successfully', async () => {
    const dto = {
      roomNumber: '101',
      type: RoomType.DOUBLE,
      capacity: 2,
      price: 100,
      currency: 'EUR',
    };

    mockRepository.exists.mockResolvedValue(false);
    mockRepository.save.mockImplementation((room) => Promise.resolve(room));

    const result = await useCase.execute(dto);

    expect(mockRepository.exists).toHaveBeenCalledWith('101');
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.getRoomNumber()).toBe('101');
    expect(result.getPrice().getAmount()).toBe(100);
  });

  it('should throw ConflictException if room number already exists', async () => {
    const dto = {
      roomNumber: '101',
      type: RoomType.DOUBLE,
      capacity: 2,
      price: 100,
      currency: 'EUR',
    };

    mockRepository.exists.mockResolvedValue(true);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});

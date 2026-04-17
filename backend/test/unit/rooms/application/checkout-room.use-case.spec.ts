import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutRoomUseCase } from '../../../../src/rooms/application/use-cases/checkout-room.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';
import { NotFoundException } from '@nestjs/common';

describe('CheckoutRoomUseCase', () => {
  let useCase: CheckoutRoomUseCase;
  let mockRepository: any;
  let factory: RoomFactory;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutRoomUseCase,
        RoomFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CheckoutRoomUseCase>(CheckoutRoomUseCase);
    factory = module.get<RoomFactory>(RoomFactory);
  });

  it('should mark occupied room as dirty after checkout', async () => {
    const room = factory.createSimpleRoom('101', 50);
    room.occupy(); // Make it occupied first

    mockRepository.findById.mockResolvedValue(room);
    mockRepository.save.mockImplementation((r) => Promise.resolve(r));

    const result = await useCase.execute('test-id');

    expect(result.getStatus().getValue()).toBe('DIRTY');
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if room does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw error if room is not occupied', async () => {
    const room = factory.createSimpleRoom('101', 50);
    // Room is available by default

    mockRepository.findById.mockResolvedValue(room);

    await expect(useCase.execute('test-id')).rejects.toThrow(
      "n'est pas occupee",
    );
  });

  it('should throw error if room is already dirty', async () => {
    const room = factory.createSimpleRoom('101', 50);
    room.occupy();
    room.checkout(); // Room is now dirty

    mockRepository.findById.mockResolvedValue(room);

    await expect(useCase.execute('test-id')).rejects.toThrow(
      "n'est pas occupee",
    );
  });

  it('should throw error if room is in maintenance', async () => {
    const room = factory.createSimpleRoom('101', 50);
    room.setMaintenance(); // Room is in maintenance

    mockRepository.findById.mockResolvedValue(room);

    await expect(useCase.execute('test-id')).rejects.toThrow(
      "n'est pas occupee",
    );
  });
});

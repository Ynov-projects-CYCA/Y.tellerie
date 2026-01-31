import { Test, TestingModule } from '@nestjs/testing';
import { CleanRoomUseCase } from '../../../../src/rooms/application/use-cases/clean-room.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';
import { NotFoundException } from '@nestjs/common';

describe('CleanRoomUseCase', () => {
  let useCase: CleanRoomUseCase;
  let mockRepository: any;
  let factory: RoomFactory;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleanRoomUseCase,
        RoomFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CleanRoomUseCase>(CleanRoomUseCase);
    factory = module.get<RoomFactory>(RoomFactory);
  });

  it('should clean a dirty room and mark it as available', async () => {
    const room = factory.createSimpleRoom('101', 50);
    room.occupy(); // Make it occupied
    room.checkout(); // Make it dirty

    mockRepository.findById.mockResolvedValue(room);
    mockRepository.save.mockImplementation((r) => Promise.resolve(r));

    const result = await useCase.execute('test-id');

    expect(result.getStatus().getValue()).toBe('AVAILABLE');
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if room does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw error if room is not dirty', async () => {
    const room = factory.createSimpleRoom('101', 50);
    // Room is available by default

    mockRepository.findById.mockResolvedValue(room);

    await expect(useCase.execute('test-id')).rejects.toThrow(
      `Room with id test-id is not dirty`,
    );
  });

  it('should throw error if room is occupied', async () => {
    const room = factory.createSimpleRoom('101', 50);
    room.occupy(); // Make it occupied, not dirty

    mockRepository.findById.mockResolvedValue(room);

    await expect(useCase.execute('test-id')).rejects.toThrow(
      'is not dirty',
    );
  });
});

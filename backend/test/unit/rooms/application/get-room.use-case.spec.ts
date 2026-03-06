import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetRoomUseCase } from '../../../../src/rooms/application/use-cases/get-room.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';

describe('GetRoomUseCase', () => {
  let useCase: GetRoomUseCase;
  let mockRepository: any;
  let factory: RoomFactory;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRoomUseCase,
        RoomFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetRoomUseCase>(GetRoomUseCase);
    factory = module.get<RoomFactory>(RoomFactory);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a room by id', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);

      const result = await useCase.execute(room.getId());

      expect(result).toBe(room);
      expect(mockRepository.findById).toHaveBeenCalledWith(room.getId());
    });

    it('should throw NotFoundException if room does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should return room with correct properties', async () => {
      const room = factory.createDoubleRoom('202', 100);
      mockRepository.findById.mockResolvedValue(room);

      const result = await useCase.execute(room.getId());

      expect(result.getRoomNumber()).toBe('202');
      expect(result.getType().getValue()).toBe('DOUBLE');
      expect(result.getCapacity()).toBe(2);
      expect(result.getPrice().getAmount()).toBe(100);
      expect(result.getStatus().getValue()).toBe('AVAILABLE');
    });

    it('should return occupied room', async () => {
      const room = factory.createSuiteRoom('301', 150);
      room.occupy();
      mockRepository.findById.mockResolvedValue(room);

      const result = await useCase.execute(room.getId());

      expect(result.getStatus().getValue()).toBe('OCCUPIED');
    });

    it('should return dirty room', async () => {
      const room = factory.createSimpleRoom('401', 50);
      room.occupy();
      room.checkout();
      mockRepository.findById.mockResolvedValue(room);

      const result = await useCase.execute(room.getId());

      expect(result.getStatus().getValue()).toBe('DIRTY');
    });
  });
});

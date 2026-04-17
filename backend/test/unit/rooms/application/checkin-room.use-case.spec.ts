import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CheckinRoomUseCase } from '../../../../src/rooms/application/use-cases/checkin-room.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';

describe('CheckinRoomUseCase', () => {
  let useCase: CheckinRoomUseCase;
  let mockRepository: any;
  let factory: RoomFactory;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckinRoomUseCase,
        RoomFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CheckinRoomUseCase>(CheckinRoomUseCase);
    factory = module.get<RoomFactory>(RoomFactory);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should mark available room as occupied during checkin', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const result = await useCase.execute('test-id');

      expect(result.getStatus().getValue()).toBe('OCCUPIED');
      expect(mockRepository.save).toHaveBeenCalledWith(room);
    });

    it('should throw NotFoundException if room does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if room is not available', async () => {
      const room = factory.createSimpleRoom('102', 50);
      room.occupy();
      mockRepository.findById.mockResolvedValue(room);

      await expect(useCase.execute('test-id')).rejects.toThrow(
        "n'est pas disponible pour le check-in",
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if room is dirty', async () => {
      const room = factory.createSimpleRoom('103', 50);
      room.occupy();
      room.checkout();
      mockRepository.findById.mockResolvedValue(room);

      await expect(useCase.execute('test-id')).rejects.toThrow(
        "n'est pas disponible pour le check-in",
      );
    });

    it('should throw error if room is in maintenance', async () => {
      const room = factory.createSimpleRoom('104', 50);
      room.setMaintenance();
      mockRepository.findById.mockResolvedValue(room);

      await expect(useCase.execute('test-id')).rejects.toThrow(
        "n'est pas disponible pour le check-in",
      );
    });

    it('should persist the occupied status', async () => {
      const room = factory.createDoubleRoom('201', 100);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      await useCase.execute('test-id');

      expect(mockRepository.save).toHaveBeenCalledWith(room);
      expect(room.getStatus().getValue()).toBe('OCCUPIED');
    });

    it('should allow checkin for different room types', async () => {
      const simpleRoom = factory.createSimpleRoom('301', 50);
      const doubleRoom = factory.createDoubleRoom('302', 100);
      const suiteRoom = factory.createSuiteRoom('303', 150);

      mockRepository.findById.mockResolvedValueOnce(simpleRoom);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const result1 = await useCase.execute('id1');
      expect(result1.getStatus().isOccupied()).toBe(true);

      mockRepository.findById.mockResolvedValueOnce(doubleRoom);
      const result2 = await useCase.execute('id2');
      expect(result2.getStatus().isOccupied()).toBe(true);

      mockRepository.findById.mockResolvedValueOnce(suiteRoom);
      const result3 = await useCase.execute('id3');
      expect(result3.getStatus().isOccupied()).toBe(true);
    });
  });
});

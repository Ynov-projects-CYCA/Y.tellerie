import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateRoomUseCase } from '../../../../src/rooms/application/use-cases/update-room.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';
import { UpdateRoomDto } from '../../../../src/rooms/application/dtos/update-room.dto';
import { RoomType } from '../../../../src/rooms/domain/room-type.vo';
import { RoomStatus } from '../../../../src/rooms/domain/room-status.vo';

describe('UpdateRoomUseCase', () => {
  let useCase: UpdateRoomUseCase;
  let mockRepository: any;
  let factory: RoomFactory;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRoomUseCase,
        RoomFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateRoomUseCase>(UpdateRoomUseCase);
    factory = module.get<RoomFactory>(RoomFactory);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update room number', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const dto: UpdateRoomDto = { roomNumber: '102' };
      const result = await useCase.execute(room.getId(), dto);

      expect(result.getRoomNumber()).toBe('102');
      expect(mockRepository.save).toHaveBeenCalledWith(room);
    });

    it('should update room type', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const dto: UpdateRoomDto = { type: RoomType.DOUBLE };
      const result = await useCase.execute(room.getId(), dto);

      expect(result.getType().getValue()).toBe(RoomType.DOUBLE);
      expect(mockRepository.save).toHaveBeenCalledWith(room);
    });

    it('should update room capacity', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const dto: UpdateRoomDto = { capacity: 3 };
      const result = await useCase.execute(room.getId(), dto);

      expect(result.getCapacity()).toBe(3);
      expect(mockRepository.save).toHaveBeenCalledWith(room);
    });

    it('should update room price', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const dto: UpdateRoomDto = { price: 75 };
      const result = await useCase.execute(room.getId(), dto);

      expect(result.getPrice().getAmount()).toBe(75);
      expect(mockRepository.save).toHaveBeenCalledWith(room);
    });

    it('should update room status', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const dto: UpdateRoomDto = { status: RoomStatus.MAINTENANCE };
      const result = await useCase.execute(room.getId(), dto);

      expect(result.getStatus().getValue()).toBe(RoomStatus.MAINTENANCE);
      expect(mockRepository.save).toHaveBeenCalledWith(room);
    });

    it('should update multiple fields at once', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const dto: UpdateRoomDto = {
        roomNumber: '202',
        type: RoomType.SUITE,
        capacity: 4,
        price: 200,
        status: RoomStatus.AVAILABLE,
      };
      const result = await useCase.execute(room.getId(), dto);

      expect(result.getRoomNumber()).toBe('202');
      expect(result.getType().getValue()).toBe(RoomType.SUITE);
      expect(result.getCapacity()).toBe(4);
      expect(result.getPrice().getAmount()).toBe(200);
      expect(result.getStatus().getValue()).toBe(RoomStatus.AVAILABLE);
      expect(mockRepository.save).toHaveBeenCalledWith(room);
    });

    it('should throw NotFoundException if room does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const dto: UpdateRoomDto = { roomNumber: '102' };
      await expect(useCase.execute('non-existent-id', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should not update if no fields are provided', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      const dto: UpdateRoomDto = {};
      const result = await useCase.execute(room.getId(), dto);

      expect(result.getRoomNumber()).toBe('101');
      expect(result.getType().getValue()).toBe(RoomType.SIMPLE);
      expect(result.getCapacity()).toBe(1);
      expect(result.getPrice().getAmount()).toBe(50);
      expect(mockRepository.save).toHaveBeenCalledWith(room);
    });

    it('should validate room after update', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);

      const dto: UpdateRoomDto = { capacity: 15 }; // Invalid capacity

      await expect(useCase.execute(room.getId(), dto)).rejects.toThrow(
        'Capacity must be between 1 and 10',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should update updatedAt timestamp', async () => {
      const room = factory.createSimpleRoom('101', 50);
      const originalUpdatedAt = room.getUpdatedAt();
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.save.mockImplementation((r) => Promise.resolve(r));

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const dto: UpdateRoomDto = { roomNumber: '102' };
      const result = await useCase.execute(room.getId(), dto);

      expect(result.getUpdatedAt().getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });
  });
});

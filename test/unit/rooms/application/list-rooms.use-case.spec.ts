import { Test, TestingModule } from '@nestjs/testing';
import { ListRoomsUseCase } from '../../../../src/rooms/application/use-cases/list-rooms.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';

describe('ListRoomsUseCase', () => {
  let useCase: ListRoomsUseCase;
  let mockRepository: any;
  let factory: RoomFactory;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListRoomsUseCase,
        RoomFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListRoomsUseCase>(ListRoomsUseCase);
    factory = module.get<RoomFactory>(RoomFactory);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all rooms', async () => {
      const rooms = [
        factory.createSimpleRoom('101', 50),
        factory.createDoubleRoom('202', 100),
        factory.createSuiteRoom('301', 150),
      ];
      mockRepository.findAll.mockResolvedValue(rooms);

      const result = await useCase.execute();

      expect(result).toHaveLength(3);
      expect(result).toEqual(rooms);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array if no rooms exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should return rooms with different statuses', async () => {
      const availableRoom = factory.createSimpleRoom('101', 50);
      const occupiedRoom = factory.createDoubleRoom('202', 100);
      occupiedRoom.occupy();
      const dirtyRoom = factory.createSuiteRoom('301', 150);
      dirtyRoom.occupy();
      dirtyRoom.checkout();

      const rooms = [availableRoom, occupiedRoom, dirtyRoom];
      mockRepository.findAll.mockResolvedValue(rooms);

      const result = await useCase.execute();

      expect(result).toHaveLength(3);
      expect(result[0].getStatus().getValue()).toBe('AVAILABLE');
      expect(result[1].getStatus().getValue()).toBe('OCCUPIED');
      expect(result[2].getStatus().getValue()).toBe('DIRTY');
    });

    it('should return rooms with different types', async () => {
      const rooms = [
        factory.createSimpleRoom('101', 50),
        factory.createDoubleRoom('202', 100),
        factory.createSuiteRoom('301', 150),
      ];
      mockRepository.findAll.mockResolvedValue(rooms);

      const result = await useCase.execute();

      expect(result[0].getType().getValue()).toBe('SIMPLE');
      expect(result[1].getType().getValue()).toBe('DOUBLE');
      expect(result[2].getType().getValue()).toBe('SUITE');
    });

    it('should return rooms with correct prices', async () => {
      const rooms = [
        factory.createSimpleRoom('101', 50),
        factory.createDoubleRoom('202', 100),
        factory.createSuiteRoom('301', 150),
      ];
      mockRepository.findAll.mockResolvedValue(rooms);

      const result = await useCase.execute();

      expect(result[0].getPrice().getAmount()).toBe(50);
      expect(result[1].getPrice().getAmount()).toBe(100);
      expect(result[2].getPrice().getAmount()).toBe(150);
    });
  });
});

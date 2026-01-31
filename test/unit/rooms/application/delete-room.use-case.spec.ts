import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteRoomUseCase } from '../../../../src/rooms/application/use-cases/delete-room.use-case';
import { ROOM_REPOSITORY } from '../../../../src/rooms/application/ports/room-repository.port';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';

describe('DeleteRoomUseCase', () => {
  let useCase: DeleteRoomUseCase;
  let mockRepository: any;
  let factory: RoomFactory;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRoomUseCase,
        RoomFactory,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteRoomUseCase>(DeleteRoomUseCase);
    factory = module.get<RoomFactory>(RoomFactory);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete an existing room', async () => {
      const room = factory.createSimpleRoom('101', 50);
      mockRepository.findById.mockResolvedValue(room);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(room.getId());

      expect(mockRepository.findById).toHaveBeenCalledWith(room.getId());
      expect(mockRepository.delete).toHaveBeenCalledWith(room.getId());
    });

    it('should throw NotFoundException if room does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});

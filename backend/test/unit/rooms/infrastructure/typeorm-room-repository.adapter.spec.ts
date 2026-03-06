import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmRoomRepositoryAdapter } from '../../../../src/rooms/infrastructure/adapters/typeorm-room-repository.adapter';
import { RoomEntity } from '../../../../src/rooms/infrastructure/persistence/room.entity';
import { RoomFactory } from '../../../../src/rooms/domain/room.factory';
import { RoomType } from '../../../../src/rooms/domain/room-type.vo';

describe('TypeOrmRoomRepositoryAdapter - Integration', () => {
  let repository: TypeOrmRoomRepositoryAdapter;
  let ormRepository: Repository<RoomEntity>;
  let factory: RoomFactory;
  let module: TestingModule;

  beforeAll(async () => {
    // Validate required environment variables
    if (!process.env.POSTGRES_HOST || !process.env.POSTGRES_PORT || 
        !process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD || 
        !process.env.POSTGRES_DB) {
      throw new Error('Missing required test environment variables. Please create .env.test file from .env.test.example');
    }

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [RoomEntity],
          synchronize: true, // Only for tests
          dropSchema: true, // Clean database before each test suite
        }),
        TypeOrmModule.forFeature([RoomEntity]),
      ],
      providers: [TypeOrmRoomRepositoryAdapter, RoomFactory],
    }).compile();

    repository = module.get<TypeOrmRoomRepositoryAdapter>(
      TypeOrmRoomRepositoryAdapter,
    );
    ormRepository = module.get('RoomEntityRepository');
    factory = module.get<RoomFactory>(RoomFactory);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await ormRepository.clear();
  });

  describe('save and findById', () => {
    it('should persist room with correct price and status', async () => {
      const room = factory.createDoubleRoom('101', 100);

      const saved = await repository.save(room);
      expect(saved.getId()).toBeDefined();

      const found = await repository.findById(saved.getId());
      expect(found).not.toBeNull();
      expect(found!.getRoomNumber()).toBe('101');
      expect(found!.getType().getValue()).toBe(RoomType.DOUBLE);
      expect(found!.getCapacity()).toBe(2);
      expect(parseFloat(found!.getPrice().getAmount().toString())).toBe(100);
      expect(found!.getPrice().getCurrency()).toBe('EUR');
      expect(found!.getStatus().getValue()).toBe('AVAILABLE');
    });

    it('should persist room status changes', async () => {
      const room = factory.createSimpleRoom('102', 50);
      const saved = await repository.save(room);

      // Change status
      saved.occupy();
      await repository.save(saved);

      const found = await repository.findById(saved.getId());
      expect(found!.getStatus().getValue()).toBe('OCCUPIED');
    });

    it('should persist room after checkout (dirty status)', async () => {
      const room = factory.createSimpleRoom('103', 50);
      const saved = await repository.save(room);

      // Occupy then checkout
      saved.occupy();
      await repository.save(saved);
      saved.checkout();
      const updated = await repository.save(saved);

      const found = await repository.findById(updated.getId());
      expect(found!.getStatus().getValue()).toBe('DIRTY');
    });

    it('should persist price updates', async () => {
      const room = factory.createSuiteRoom('104', 150);
      const saved = await repository.save(room);

      // Update price
      const newPrice = require('../../../../src/rooms/domain/price.vo').PriceVO.create(200);
      saved.updateDetails(undefined, undefined, undefined, newPrice);
      await repository.save(saved);

      const found = await repository.findById(saved.getId());
      expect(parseFloat(found!.getPrice().getAmount().toString())).toBe(200);
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      await repository.save(factory.createSimpleRoom('201', 50));
      await repository.save(factory.createDoubleRoom('202', 80));
      await repository.save(factory.createSuiteRoom('203', 150));

      const rooms = await repository.findAll();
      expect(rooms).toHaveLength(3);
    });
  });

  describe('findByRoomNumber', () => {
    it('should find room by room number', async () => {
      const room = factory.createDoubleRoom('301', 100);
      await repository.save(room);

      const found = await repository.findByRoomNumber('301');
      expect(found).not.toBeNull();
      expect(found!.getRoomNumber()).toBe('301');
    });

    it('should return null if room number does not exist', async () => {
      const found = await repository.findByRoomNumber('999');
      expect(found).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a room', async () => {
      const room = factory.createSimpleRoom('401', 50);
      const saved = await repository.save(room);

      await repository.delete(saved.getId());

      const found = await repository.findById(saved.getId());
      expect(found).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true if room number exists', async () => {
      const room = factory.createDoubleRoom('501', 100);
      await repository.save(room);

      const exists = await repository.exists('501');
      expect(exists).toBe(true);
    });

    it('should return false if room number does not exist', async () => {
      const exists = await repository.exists('999');
      expect(exists).toBe(false);
    });
  });
});

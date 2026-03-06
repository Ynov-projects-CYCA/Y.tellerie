import { RoomFactory } from '../../../../src/rooms/domain/room.factory';
import { RoomType, RoomTypeVO } from '../../../../src/rooms/domain/room-type.vo';
import { PriceVO } from '../../../../src/rooms/domain/price.vo';
import { RoomStatusVO } from '../../../../src/rooms/domain/room-status.vo';

describe('RoomFactory', () => {
  let factory: RoomFactory;

  beforeEach(() => {
    factory = new RoomFactory();
  });

  describe('createSimpleRoom', () => {
    it('should create a simple room with correct properties', () => {
      const room = factory.createSimpleRoom('101', 50);

      expect(room.getRoomNumber()).toBe('101');
      expect(room.getType().getValue()).toBe(RoomType.SIMPLE);
      expect(room.getCapacity()).toBe(1);
      expect(room.getPrice().getAmount()).toBe(50);
      expect(room.getStatus().getValue()).toBe('AVAILABLE');
    });
  });

  describe('createDoubleRoom', () => {
    it('should create a double room with correct properties', () => {
      const room = factory.createDoubleRoom('201', 80);

      expect(room.getRoomNumber()).toBe('201');
      expect(room.getType().getValue()).toBe(RoomType.DOUBLE);
      expect(room.getCapacity()).toBe(2);
      expect(room.getPrice().getAmount()).toBe(80);
      expect(room.getStatus().getValue()).toBe('AVAILABLE');
    });
  });

  describe('createSuiteRoom', () => {
    it('should create a suite room with correct properties', () => {
      const room = factory.createSuiteRoom('301', 150, 4);

      expect(room.getRoomNumber()).toBe('301');
      expect(room.getType().getValue()).toBe(RoomType.SUITE);
      expect(room.getCapacity()).toBe(4);
      expect(room.getPrice().getAmount()).toBe(150);
      expect(room.getStatus().getValue()).toBe('AVAILABLE');
    });

    it('should create a suite room with default capacity', () => {
      const room = factory.createSuiteRoom('302', 150);

      expect(room.getCapacity()).toBe(4);
    });
  });

  describe('createRoom', () => {
    it('should create a room with custom properties', () => {
      const type = RoomTypeVO.create(RoomType.DOUBLE);
      const price = PriceVO.create(100, 'USD');
      const status = RoomStatusVO.maintenance();

      const room = factory.createRoom('401', type, 3, price, status);

      expect(room.getRoomNumber()).toBe('401');
      expect(room.getType().getValue()).toBe(RoomType.DOUBLE);
      expect(room.getCapacity()).toBe(3);
      expect(room.getPrice().getAmount()).toBe(100);
      expect(room.getPrice().getCurrency()).toBe('USD');
      expect(room.getStatus().getValue()).toBe('MAINTENANCE');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a room from persistence', () => {
      const id = 'test-id';
      const type = RoomTypeVO.create(RoomType.SIMPLE);
      const price = PriceVO.create(60);
      const status = RoomStatusVO.occupied();
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-15');

      const room = factory.reconstitute(
        id,
        '501',
        type,
        1,
        price,
        status,
        createdAt,
        updatedAt,
      );

      expect(room.getId()).toBe(id);
      expect(room.getRoomNumber()).toBe('501');
      expect(room.getCreatedAt()).toEqual(createdAt);
      expect(room.getUpdatedAt()).toEqual(updatedAt);
    });
  });
});

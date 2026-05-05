import { Room } from '../../../../src/rooms/domain/room.entity';
import { RoomTypeVO, RoomType } from '../../../../src/rooms/domain/room-type.vo';
import { PriceVO } from '../../../../src/rooms/domain/price.vo';
import { RoomStatusVO } from '../../../../src/rooms/domain/room-status.vo';

describe('Room Entity', () => {
  let room: Room;

  beforeEach(() => {
    const type = RoomTypeVO.create(RoomType.DOUBLE);
    const price = PriceVO.create(100);
    const status = RoomStatusVO.available();

    room = new Room(
      'test-id',
      '101',
      type,
      2,
      price,
      status,
      new Date(),
      new Date(),
    );
  });

  describe('validation', () => {
    it('should throw error if room number is empty', () => {
      const type = RoomTypeVO.create(RoomType.SIMPLE);
      const price = PriceVO.create(50);
      const status = RoomStatusVO.available();

      expect(() => {
        new Room('id', '', type, 1, price, status);
      }).toThrow('Le numero de chambre est requis');
    });

    it('should throw error if capacity is less than 1', () => {
      const type = RoomTypeVO.create(RoomType.SIMPLE);
      const price = PriceVO.create(50);
      const status = RoomStatusVO.available();

      expect(() => {
        new Room('id', '101', type, 0, price, status);
      }).toThrow('La capacite doit etre comprise entre 1 et 10');
    });

    it('should throw error if capacity is greater than 10', () => {
      const type = RoomTypeVO.create(RoomType.SUITE);
      const price = PriceVO.create(200);
      const status = RoomStatusVO.available();

      expect(() => {
        new Room('id', '101', type, 11, price, status);
      }).toThrow('La capacite doit etre comprise entre 1 et 10');
    });
  });

  describe('updateDetails', () => {
    it('should update room details', () => {
      const newType = RoomTypeVO.create(RoomType.SUITE);
      const newPrice = PriceVO.create(150);

      room.updateDetails('102', newType, 4, newPrice);

      expect(room.getRoomNumber()).toBe('102');
      expect(room.getType().getValue()).toBe(RoomType.SUITE);
      expect(room.getCapacity()).toBe(4);
      expect(room.getPrice().getAmount()).toBe(150);
    });
  });

  describe('checkout', () => {
    it('should mark room as dirty after checkout', () => {
      // First occupy the room
      room.occupy();
      expect(room.getStatus().getValue()).toBe('OCCUPIED');

      // Then checkout
      room.checkout();
      expect(room.getStatus().isDirty()).toBe(true);
      expect(room.getStatus().getValue()).toBe('DIRTY');
    });

    it('should throw error if room is not occupied', () => {
      expect(() => {
        room.checkout();
      }).toThrow('Seules les chambres occupees peuvent etre liberees');
    });
  });

  describe('clean', () => {
    it('should make dirty room available after cleaning', () => {
      // Occupy, checkout to make it dirty
      room.occupy();
      room.checkout();
      expect(room.getStatus().isDirty()).toBe(true);

      // Clean the room
      room.clean();
      expect(room.getStatus().isAvailable()).toBe(true);
      expect(room.getStatus().getValue()).toBe('AVAILABLE');
    });

    it('should throw error if room is not dirty', () => {
      expect(() => {
        room.clean();
      }).toThrow('Seules les chambres sales peuvent etre nettoyees');
    });
  });

  describe('occupy', () => {
    it('should mark available room as occupied', () => {
      room.occupy();
      expect(room.getStatus().getValue()).toBe('OCCUPIED');
    });

    it('should throw error if room is not available', () => {
      room.occupy();
      expect(() => {
        room.occupy();
      }).toThrow('Seules les chambres disponibles peuvent etre occupees');
    });
  });

  describe('setMaintenance', () => {
    it('should set room to maintenance status', () => {
      room.setMaintenance();
      expect(room.getStatus().getValue()).toBe('MAINTENANCE');
    });
  });
});

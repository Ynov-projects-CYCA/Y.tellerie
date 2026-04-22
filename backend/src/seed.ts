import { AppDataSource } from './config/typeorm.config';
import { RoomEntity } from './rooms/infrastructure/persistence/room.entity';
import { RoomType } from './rooms/domain/room-type.vo';
import { RoomStatus } from './rooms/domain/room-status.vo';

async function seed() {
  try {
    console.log('Starting database seeding (24 rooms)...');
    await AppDataSource.initialize();
    console.log('Data Source has been initialized.');

    const roomRepository = AppDataSource.getRepository(RoomEntity);
    const roomsData: any[] = [];

    // Floor 1: Primarily Simple and Double
    for (let i = 1; i <= 8; i++) {
      roomsData.push({
        roomNumber: `10${i}`,
        type: i % 2 === 0 ? RoomType.DOUBLE : RoomType.SIMPLE,
        capacity: i % 2 === 0 ? 2 : 1,
        price: i % 2 === 0 ? 120 : 85,
        status: RoomStatus.AVAILABLE,
      });
    }

    // Floor 2: Double and some Suites
    for (let i = 1; i <= 8; i++) {
      roomsData.push({
        roomNumber: `20${i}`,
        type: i > 6 ? RoomType.SUITE : RoomType.DOUBLE,
        capacity: i > 6 ? 3 : 2,
        price: i > 6 ? 250 : 145,
        status: RoomStatus.AVAILABLE,
      });
    }

    // Floor 3: Premium Suites
    for (let i = 1; i <= 8; i++) {
      roomsData.push({
        roomNumber: `30${i}`,
        type: RoomType.SUITE,
        capacity: i % 2 === 0 ? 4 : 2,
        price: i % 2 === 0 ? 450 : 320,
        status: RoomStatus.AVAILABLE,
      });
    }

    for (const data of roomsData) {
      const existing = await roomRepository.findOneBy({ roomNumber: data.roomNumber });
      if (!existing) {
        const room = roomRepository.create({
          id: crypto.randomUUID(),
          ...data,
          currency: 'EUR',
        });
        await roomRepository.save(room);
        console.log(`Room ${data.roomNumber} created (${data.type})`);
      } else {
        console.log(`Room ${data.roomNumber} already exists, skipping`);
      }
    }

    console.log('Seeding completed successfully.');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './infrastructure/persistence/room.entity';
import { RoomsController } from './infrastructure/rooms.controller';
import { RoomFactory } from './domain/room.factory';
import { CreateRoomUseCase } from './application/use-cases/create-room.use-case';
import { UpdateRoomUseCase } from './application/use-cases/update-room.use-case';
import { DeleteRoomUseCase } from './application/use-cases/delete-room.use-case';
import { GetRoomUseCase } from './application/use-cases/get-room.use-case';
import { ListRoomsUseCase } from './application/use-cases/list-rooms.use-case';
import { CheckoutRoomUseCase } from './application/use-cases/checkout-room.use-case';
import { CleanRoomUseCase } from './application/use-cases/clean-room.use-case';
import { CheckinRoomUseCase } from './application/use-cases/checkin-room.use-case';
import { TypeOrmRoomRepositoryAdapter } from './infrastructure/adapters/typeorm-room-repository.adapter';
import { ROOM_REPOSITORY } from './application/ports/room-repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity])],
  controllers: [RoomsController],
  providers: [
    RoomFactory,
    {
      provide: ROOM_REPOSITORY,
      useClass: TypeOrmRoomRepositoryAdapter,
    },
    CreateRoomUseCase,
    UpdateRoomUseCase,
    DeleteRoomUseCase,
    GetRoomUseCase,
    ListRoomsUseCase,
    CheckoutRoomUseCase,
    CleanRoomUseCase,
    CheckinRoomUseCase,
  ],
  exports: [RoomFactory, ROOM_REPOSITORY],
})
export class RoomsModule {}

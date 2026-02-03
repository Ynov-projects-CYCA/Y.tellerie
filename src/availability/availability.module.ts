import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from '../reservations/infrastructure/persistence/reservation.entity';
import { AvailabilityController } from './availability.controller';
import { CheckAvailabilityUseCase } from '../reservations/application/use-cases/check-availability.use-case';
import { TypeOrmReservationRepositoryAdapter } from '../reservations/infrastructure/adapters/typeorm-reservation-repository.adapter';
import { RESERVATION_REPOSITORY } from '../reservations/application/ports/reservation-repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationEntity])],
  controllers: [AvailabilityController],
  providers: [
    {
      provide: RESERVATION_REPOSITORY,
      useClass: TypeOrmReservationRepositoryAdapter,
    },
    CheckAvailabilityUseCase,
  ],
  exports: [RESERVATION_REPOSITORY],
})
export class AvailabilityModule {}

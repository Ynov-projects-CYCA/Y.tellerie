import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './infrastructure/persistence/booking.entity';
import { BookingsController } from './infrastructure/bookings.controller';
import { BookingFactory } from './domain/booking.factory';
import { RoomsModule } from '@/rooms/rooms.module';
import { MailjetModule } from '@/mailjet/mailjet.module';
import { BOOKING_REPOSITORY } from './application/ports/booking-repository.port';
import { TypeOrmBookingRepositoryAdapter } from './infrastructure/adapters/typeorm-booking-repository.adapter';
import { SearchAvailabilityUseCase } from './application/use-cases/search-availability.use-case';
import { GetBookingSummaryUseCase } from './application/use-cases/get-booking-summary.use-case';
import { ConfirmBookingUseCase } from './application/use-cases/confirm-booking.use-case';
import { GetBookingUseCase } from './application/use-cases/get-booking.use-case';
import { ListBookingsUseCase } from './application/use-cases/list-bookings.use-case';
import { CancelBookingUseCase } from './application/use-cases/cancel-booking.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([BookingEntity]), RoomsModule, MailjetModule],
  controllers: [BookingsController],
  providers: [
    {
      provide: BOOKING_REPOSITORY,
      useClass: TypeOrmBookingRepositoryAdapter,
    },
    BookingFactory,
    SearchAvailabilityUseCase,
    GetBookingSummaryUseCase,
    ConfirmBookingUseCase,
    GetBookingUseCase,
    ListBookingsUseCase,
    CancelBookingUseCase,
  ],
  exports: [BOOKING_REPOSITORY],
})

export class BookingsModule {}

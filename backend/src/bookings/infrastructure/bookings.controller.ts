import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchAvailabilityQueryDto } from '@/bookings/application/dtos/search-availability-query.dto';
import {
  AvailableRoomResult,
  SearchAvailabilityUseCase,
} from '@/bookings/application/use-cases/search-availability.use-case';
import { AvailabilityResponseDto } from '@/bookings/application/dtos/availability-response.dto';
import { RoomResponseDto } from '@/rooms/application/dtos/room-response.dto';
import { BookingSummaryDto } from '@/bookings/application/dtos/booking-summary.dto';
import {
  BookingSummaryResult,
  GetBookingSummaryUseCase,
} from '@/bookings/application/use-cases/get-booking-summary.use-case';
import { BookingSummaryResponseDto } from '@/bookings/application/dtos/booking-summary-response.dto';
import {
  ConfirmBookingResult,
  ConfirmBookingUseCase,
} from '@/bookings/application/use-cases/confirm-booking.use-case';
import { BookingResponseDto } from '@/bookings/application/dtos/booking-response.dto';
import {
  GetBookingResult,
  GetBookingUseCase,
} from '@/bookings/application/use-cases/get-booking.use-case';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly searchAvailabilityUseCase: SearchAvailabilityUseCase,
    private readonly getBookingSummaryUseCase: GetBookingSummaryUseCase,
    private readonly confirmBookingUseCase: ConfirmBookingUseCase,
    private readonly getBookingUseCase: GetBookingUseCase,
  ) {}

  @Get('availability')
  async searchAvailability(
    @Query() query: SearchAvailabilityQueryDto,
  ): Promise<AvailabilityResponseDto[]> {
    const results = await this.searchAvailabilityUseCase.execute(query);
    return results.map((result) => this.toAvailabilityResponse(result));
  }

  @Post('summary')
  async summary(
    @Body() dto: BookingSummaryDto,
  ): Promise<BookingSummaryResponseDto> {
    const result = await this.getBookingSummaryUseCase.execute(dto);
    return this.toSummaryResponse(result);
  }

  @Post()
  async confirm(@Body() dto: BookingSummaryDto): Promise<BookingResponseDto> {
    const result = await this.confirmBookingUseCase.execute(dto);
    return this.toBookingResponse(result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookingResponseDto> {
    const result = await this.getBookingUseCase.execute(id);
    return this.toBookingDetailResponse(result);
  }

  private toAvailabilityResponse(
    result: AvailableRoomResult,
  ): AvailabilityResponseDto {
    const dto = new AvailabilityResponseDto();
    dto.room = RoomResponseDto.fromDomain(result.room);
    dto.checkInDate = result.checkInDate;
    dto.checkOutDate = result.checkOutDate;
    dto.nights = result.nights;
    dto.totalPrice = result.totalPrice;
    dto.currency = result.currency;
    return dto;
  }

  private toSummaryResponse(
    result: BookingSummaryResult,
  ): BookingSummaryResponseDto {
    const dto = new BookingSummaryResponseDto();
    dto.room = RoomResponseDto.fromDomain(result.room);
    dto.guestFirstName = result.guestFirstName;
    dto.guestLastName = result.guestLastName;
    dto.guestEmail = result.guestEmail;
    dto.checkInDate = result.checkInDate;
    dto.checkOutDate = result.checkOutDate;
    dto.nights = result.nights;
    dto.totalPrice = result.totalPrice;
    dto.currency = result.currency;
    dto.specialRequests = result.specialRequests;
    return dto;
  }

  private toBookingResponse(result: ConfirmBookingResult): BookingResponseDto {
    const dto = new BookingResponseDto();
    dto.id = result.booking.getId();
    dto.room = RoomResponseDto.fromDomain(result.room);
    dto.guestFirstName = result.booking.getGuestFirstName();
    dto.guestLastName = result.booking.getGuestLastName();
    dto.guestEmail = result.booking.getGuestEmail();
    dto.checkInDate = result.booking.getCheckInDate();
    dto.checkOutDate = result.booking.getCheckOutDate();
    dto.nights = result.booking.getNights();
    dto.totalPrice = result.booking.getTotalPrice();
    dto.currency = result.booking.getCurrency();
    dto.status = result.booking.getStatus().getValue();
    dto.specialRequests = result.booking.getSpecialRequests();
    dto.createdAt = result.booking.getCreatedAt();
    dto.updatedAt = result.booking.getUpdatedAt();
    return dto;
  }

  private toBookingDetailResponse(
    result: GetBookingResult,
  ): BookingResponseDto {
    const dto = new BookingResponseDto();
    dto.id = result.booking.getId();
    dto.room = RoomResponseDto.fromDomain(result.room);
    dto.guestFirstName = result.booking.getGuestFirstName();
    dto.guestLastName = result.booking.getGuestLastName();
    dto.guestEmail = result.booking.getGuestEmail();
    dto.checkInDate = result.booking.getCheckInDate();
    dto.checkOutDate = result.booking.getCheckOutDate();
    dto.nights = result.booking.getNights();
    dto.totalPrice = result.booking.getTotalPrice();
    dto.currency = result.booking.getCurrency();
    dto.status = result.booking.getStatus().getValue();
    dto.specialRequests = result.booking.getSpecialRequests();
    dto.createdAt = result.booking.getCreatedAt();
    dto.updatedAt = result.booking.getUpdatedAt();
    return dto;
  }
}

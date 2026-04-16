import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class BookingSummaryDto {
  @ApiProperty({ example: '2f885cc5-2bcb-473b-95d1-14e6a25d97c8' })
  @IsNotEmpty()
  @IsString()
  roomId!: string;

  @ApiProperty({ example: '2026-04-10' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2026-04-13' })
  @IsDateString()
  checkOutDate!: string;

  @ApiProperty({ example: 'Ada' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  guestFirstName!: string;

  @ApiProperty({ example: 'Lovelace' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  guestLastName!: string;

  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  guestEmail!: string;

  @ApiPropertyOptional({ example: 'Arrivée tardive après 22h.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialRequests?: string;
}

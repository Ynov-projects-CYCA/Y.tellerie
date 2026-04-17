import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { RoomType } from '@/rooms/domain/room-type.vo';
import { RoomStatus } from '@/rooms/domain/room-status.vo';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomDto {
  
  @ApiPropertyOptional({ description: 'The room number', example: '101' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'The type of the room', example: 'SIMPLE, DOUBLE, SUITE' })
  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @ApiPropertyOptional({ description: 'The capacity of the room', example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  capacity?: number;

  @ApiPropertyOptional({ description: 'The price of the room', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'The currency of the price', example: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'The status of the room', example: 'AVAILABLE, OCCUPIED, MAINTENANCE' })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}

import { IsNotEmpty, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { RoomType } from '../../domain/room-type.vo';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ description: 'The room number', example: '101' })
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @ApiProperty({ description: 'The type of the room', example: 'SIMPLE, DOUBLE, SUITE' })
  @IsNotEmpty()
  @IsEnum(RoomType)
  type: RoomType;

  @ApiProperty({ description: 'The capacity of the room', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  capacity: number;

  @ApiProperty({ description: 'The price of the room', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'The currency of the price', example: 'EUR' })
  @IsString()
  currency?: string = 'EUR';
}

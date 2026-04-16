import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { RoomType } from '../../../rooms/domain/room-type.vo';

export class SearchAvailabilityQueryDto {
  @ApiProperty({ example: '2026-04-10' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2026-04-13' })
  @IsDateString()
  checkOutDate!: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ enum: RoomType, example: RoomType.DOUBLE })
  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;
}

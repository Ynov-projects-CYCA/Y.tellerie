import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'Jean' })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiProperty({ required: false, example: 'Dupont' })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiProperty({ required: false, example: 'jean.dupont@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: '0612345678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false, example: '0612345678' })
  @IsOptional()
  @IsString()
  phone?: string;
}

import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../domain/role.vo';

export class RegisterDto {
  @ApiProperty({ description: 'The first name of the user', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ description: 'The last name of the user', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+33123456789',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'The password for the user (min 8 characters)',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'The initial role assigned to the user',
    enum: Role,
    example: Role.CLIENT,
  })
  @IsEnum(Role)
  role: Role;
}

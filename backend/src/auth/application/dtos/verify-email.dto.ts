import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'The email verification token',
    example: '2a4d4ab0-fd8e-4f1a-b18d-2aa04df27512',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

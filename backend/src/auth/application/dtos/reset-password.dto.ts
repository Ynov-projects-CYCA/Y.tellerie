import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StrongPassword } from './password-policy';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The raw password reset token received by email',
    example: '3d3b4b7bbf704daa8d509a17d7d6f08e',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description:
      'The new password for the user (min 8 characters, uppercase, number and special character)',
    example: 'NewPassword1!',
  })
  @IsString()
  @IsNotEmpty()
  @StrongPassword()
  password: string;
}

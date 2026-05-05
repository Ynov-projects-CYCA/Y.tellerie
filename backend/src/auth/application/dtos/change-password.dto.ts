import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StrongPassword } from './password-policy';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The old password of the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description:
      'The new password for the user (min 8 characters, uppercase, number and special character)',
    example: 'NewPassword1!',
  })
  @IsString()
  @IsNotEmpty()
  @StrongPassword()
  newPassword: string;
}

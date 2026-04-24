import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({ description: 'The first name of the user', example: 'John' })
  firstname: string;

  @ApiProperty({ description: 'The last name of the user', example: 'Doe' })
  lastname: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+33612345678',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Whether the account is active',
    example: false,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+33123456789',
  })
  phone: string;

  @ApiProperty({ description: 'The roles assigned to the user', example: ['client'] })
  roles: string[];
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'The access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'The refresh token for authentication',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  refreshToken: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: "Message de resultat de l'inscription",
    example: 'Compte cree. Verifiez votre adresse e-mail avant de vous connecter.',
  })
  message: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}

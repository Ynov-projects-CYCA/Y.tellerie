import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ description: 'The unique identifier of the user', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  id: string;

  @ApiProperty({ description: 'The first name of the user', example: 'John' })
  firstname: string;

  @ApiProperty({ description: 'The last name of the user', example: 'Doe' })
  lastname: string;

  @ApiProperty({ description: 'The email address of the user', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'The roles assigned to the user', example: ['user', 'admin'] })
  roles: string[];
}

export class AuthResponseDto {
  @ApiProperty({ description: 'The access token for authentication', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: 'The refresh token for renewing access tokens', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  refreshToken: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}

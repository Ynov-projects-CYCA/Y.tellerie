// This DTO can be used to type the response for login and refresh token endpoints.
// We can also use mappers to transform the domain entities (User, RefreshToken)
// into a plain object before sending it to the client.

interface UserResponse {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: string[];
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

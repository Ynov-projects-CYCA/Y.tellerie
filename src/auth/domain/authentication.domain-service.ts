import { UserAggregate } from './user.aggregate';
import { Password } from './password.vo';
import { RefreshToken } from './refresh-token.entity';

// This is a placeholder for a potential domain service.
// Domain services are used for logic that doesn't naturally fit within an entity or value object.
// It often orchestrates actions between multiple domain objects.
// As the application grows, some logic from the use cases might be moved here
// if it represents a core, reusable domain process.

export class AuthenticationDomainService {
  public canUserLogin(user: UserAggregate): boolean {
    // In the future, we might add logic here to check if a user is banned,
    // not verified, etc.
    // For now, any user can log in.
    return true;
  }

  public isRefreshTokenValid(
    token: RefreshToken,
    user: UserAggregate,
  ): boolean {
    if (token.isExpired() || token.getProperties().isRevoked) {
      return false;
    }
    return token.getProperties().userId.equals(user.getProperties().id);
  }
}

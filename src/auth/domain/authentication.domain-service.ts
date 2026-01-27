import { UserAggregate } from './user.aggregate';
import { RefreshToken } from './refresh-token.entity';

export class AuthenticationDomainService {
  public canUserLogin(user: UserAggregate): boolean {
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

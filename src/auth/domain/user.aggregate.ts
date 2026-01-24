import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';

/**
 * In this domain, the User is the aggregate root.
 * An aggregate is a cluster of domain objects that can be treated as a single unit.
 * The UserAggregate encapsulates the User entity and could also include related
 * objects that are managed as part of the same transactional consistency boundary,
 * such as a collection of RefreshTokens.
 *
 * For now, our aggregate is simple and is a direct wrapper around the User entity.
 */
export class UserAggregate extends User {
  private _refreshTokens: RefreshToken[] = [];

  get refreshTokens(): RefreshToken[] {
    return this._refreshTokens;
  }

  addRefreshToken(token: RefreshToken) {
    this._refreshTokens.push(token);
  }
}

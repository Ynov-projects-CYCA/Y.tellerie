import { UserAggregate } from './user.aggregate';

export class AuthenticationDomainService {
  public canUserLogin(user: UserAggregate): boolean {
    return user.getProperties().isActive;
  }
}

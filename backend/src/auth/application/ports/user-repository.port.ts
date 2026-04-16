import { UserAggregate } from '../../domain/user.aggregate';
import { UserId } from '../../domain/user-id.vo';
import { Email } from '../../domain/email.vo';

export const IUserRepository = Symbol('IUserRepository');

export interface IUserRepository {
  save(user: UserAggregate): Promise<void>;
  findById(id: UserId): Promise<UserAggregate | null>;
  findByEmail(email: Email): Promise<UserAggregate | null>;
  findByVerifyEmailToken(token: string): Promise<UserAggregate | null>;
}

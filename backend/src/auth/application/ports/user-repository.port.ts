import { UserAggregate, UserId, Email } from '@/auth/domain';

export const IUserRepository = Symbol('IUserRepository');

export interface IUserRepository {
  save(user: UserAggregate): Promise<void>;
  findAll(): Promise<UserAggregate[]>;
  findById(id: UserId): Promise<UserAggregate | null>;
  findByEmail(email: Email): Promise<UserAggregate | null>;
  findByVerifyEmailToken(token: string): Promise<UserAggregate | null>;
  delete(id: UserId): Promise<void>;
}

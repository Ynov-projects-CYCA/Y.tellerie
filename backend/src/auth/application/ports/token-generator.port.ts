import { UserAggregate } from '@/auth/domain';

export const ITokenGenerator = Symbol('ITokenGenerator');

export interface ITokenGenerator {
  generateAccessToken(user: UserAggregate): Promise<string>;
  generateRefreshToken(): string;
}

import { UserAggregate } from '../../domain/user.aggregate';

export const ITokenGenerator = Symbol('ITokenGenerator');

export interface ITokenGenerator {
  generateAccessToken(user: UserAggregate): Promise<string>;
}

import { UserAggregate } from '@/auth/domain';
import { IAuthenticationStrategy } from '@/auth/application/strategies';

/**
 * The AuthenticationContext allows for dynamically setting and using
 * an authentication strategy.
 */
export class AuthenticationContext {
  private strategy: IAuthenticationStrategy;

  public setStrategy(strategy: IAuthenticationStrategy) {
    this.strategy = strategy;
  }

  public async validate(...args: any[]): Promise<UserAggregate> {
    if (!this.strategy) {
      throw new Error('Authentication strategy has not been set.');
    }
    return this.strategy.validate(...args);
  }
}

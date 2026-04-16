import { UserAggregate } from '../../domain/user.aggregate';

export const IAuthenticationStrategy = Symbol('IAuthenticationStrategy');

/**
 * Defines the interface for an authentication strategy.
 * This is a custom abstraction for the project's architecture.
 */
export interface IAuthenticationStrategy {
  /**
   * The name of the strategy (e.g., 'local', 'jwt').
   */
  readonly name: string;

  /**
   * Validates the user based on the provided payload.
   * @param payload The data to validate against (e.g., username/password, token).
   * @returns The authenticated user aggregate.
   */
  validate(...args: any[]): Promise<UserAggregate>;
}

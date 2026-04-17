import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from '../../../../../src/auth/application/strategies/local.strategy';
import {
  InvalidCredentialsError,
  LoginUseCase,
} from '../../../../../src/auth/application/use-cases/login.use-case';

describe('LocalStrategy', () => {
  it('should translate invalid credentials into UnauthorizedException', async () => {
    const loginUseCase = {
      execute: jest.fn().mockRejectedValue(new InvalidCredentialsError()),
    } as unknown as LoginUseCase;
    const strategy = new LocalStrategy(loginUseCase);

    await expect(
      strategy.validate('john.doe@example.com', 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

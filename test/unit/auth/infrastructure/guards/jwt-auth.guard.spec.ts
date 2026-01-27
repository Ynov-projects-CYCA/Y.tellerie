import { JwtAuthGuard } from '../../../../../src/auth/infrastructure/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  it('should be an instance of AuthGuard("jwt")', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(AuthGuard('jwt'));
  });
});

import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from '../ports/user-repository.port';
import { UserId } from '../../domain/user-id.vo';
import { ConfigService } from '@nestjs/config';

// The payload that we encode in the JWT
export interface JwtPayload {
  sub: string; // This will be the UserId
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // We need to add this to config
    });
  }

  /**
   * Passport first verifies the JWT's signature and expiration, then calls this method.
   * @param payload The decoded JWT payload.
   * @returns The user aggregate if the user exists.
   */
  async validate(payload: JwtPayload) {
    const userId = UserId.from(payload.sub);
    const user = await this.userRepository.findById(userId);
    // The user object will be attached to the request object (e.g., req.user)
    return user;
  }
}

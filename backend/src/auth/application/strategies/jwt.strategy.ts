import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from '@/auth/application/ports';
import { UserId } from '@/auth/domain';
import { JwtPayload } from '@/shared/model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the configuration.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
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
    return user;
  }
}

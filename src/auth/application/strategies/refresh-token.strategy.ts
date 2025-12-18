import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'), // We need a separate secret
      passReqToCallback: true,
    });
  }

  /**
   * Validates the refresh token. This implementation uses the RefreshTokenUseCase
   * to handle the logic, including token rotation.
   * @param req The incoming request.
   * @param payload The decoded JWT payload.
   */
  async validate(req: Request, payload: JwtPayload) {
    const refreshTokenId = req
      .get('Authorization')
      .replace('Bearer', '')
      .trim();
    return this.refreshTokenUseCase.execute({ refreshTokenId });
  }
}

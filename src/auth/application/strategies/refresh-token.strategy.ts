import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in the configuration.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtRefreshSecret,
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
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new UnauthorizedException('Refresh token missing from Authorization header.');
    }
    const refreshTokenId = authHeader.replace('Bearer', '').trim();
    return this.refreshTokenUseCase.execute({ refreshTokenId });
  }
}

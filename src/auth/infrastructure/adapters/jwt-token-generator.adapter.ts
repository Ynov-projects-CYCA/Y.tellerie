import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenGenerator } from '../../../application/ports/token-generator.port';
import { UserAggregate } from '../../../domain/user.aggregate';
import { JwtPayload } from '../../../application/strategies/jwt.strategy';

@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(user: UserAggregate): Promise<string> {
    const userProps = user.getProperties();
    const payload: JwtPayload = {
      sub: userProps.id.toString(),
      email: userProps.email.toString(),
    };
    return this.jwtService.signAsync(payload);
  }
}

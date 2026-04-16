import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenGenerator } from '@/auth/application/ports';
import { UserAggregate } from '@/auth/domain';
import { JwtPayload } from '@/shared/model';

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

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InvalidCredentialsError, LoginUseCase } from '@/auth/application/use-cases';
import { Email, Password, UserAggregate } from '@/auth/domain';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly loginUseCase: LoginUseCase) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * Passport first calls this method to validate user credentials.
   * @param email The email from the request body.
   * @param pass The password from the request body.
   * @returns The user aggregate if authentication is successful.
   */
  async validate(email: string, pass: string): Promise<UserAggregate> {
    const emailVO = Email.from(email);
    const passwordVO = Password.from(pass);
    try {
      const { user } = await this.loginUseCase.execute({
        email: emailVO,
        password: passwordVO,
      });

      return user;
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException('Invalid email or password.');
      }

      throw error;
    }
  }
}

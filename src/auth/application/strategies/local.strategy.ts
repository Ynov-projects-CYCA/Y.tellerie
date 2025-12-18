import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../use-cases/login.use-case';
import { Email } from '../../domain/email.vo';
import { Password } from '../../domain/password.vo';
import { UserAggregate } from '../../domain/user.aggregate';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly loginUseCase: LoginUseCase) {
    // We can configure the field names for username and password here
    // e.g., { usernameField: 'email', passwordField: 'password' }
    super();
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

    const { user } = await this.loginUseCase.execute({
      email: emailVO,
      password: passwordVO,
    });

    return user;
  }
}

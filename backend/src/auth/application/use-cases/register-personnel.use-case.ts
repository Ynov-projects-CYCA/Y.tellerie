import { Inject, Injectable } from '@nestjs/common';
import { UserFactory } from '../../domain/user.factory';
import { Email } from '../../domain/email.vo';
import {
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
} from '../ports/password-hasher.port';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '../ports/user-repository.port';
import { UserAggregate } from '../../domain/user.aggregate';
import { UserAlreadyExistsError } from './register-client.use-case';
import { Role } from '../../domain/role.vo';

@Injectable()
export class RegisterPersonnelUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasherSymbol)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: {
    firstname: string;
    lastname: string;
    phoneNumber: string;
    email: Email;
    rawPassword: string;
  }): Promise<UserAggregate> {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(command.email.toString());
    }

    const user = await UserFactory.create(
      {
        firstname: command.firstname,
        lastname: command.lastname,
        phoneNumber: command.phoneNumber,
        email: command.email,
        rawPassword: command.rawPassword,
      },
      this.passwordHasher,
      Role.PERSONNEL,
    );

    await this.userRepository.save(user);

    return user;
  }
}

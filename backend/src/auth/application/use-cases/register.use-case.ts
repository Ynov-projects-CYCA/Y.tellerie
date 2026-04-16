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
import { Role } from '../../domain/role.vo';

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists.`);
  }
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasherSymbol)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: {
    firstname: string;
    lastname: string;
    email: Email;
    phone: string;
    rawPassword: string;
    role: Role;
  }): Promise<UserAggregate> {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(command.email.toString());
    }

    const user = await UserFactory.create(
      {
        firstname: command.firstname,
        lastname: command.lastname,
        email: command.email,
        phone: command.phone,
        rawPassword: command.rawPassword,
      },
      this.passwordHasher,
      command.role,
    );

    await this.userRepository.save(user);

    return user;
  }
}

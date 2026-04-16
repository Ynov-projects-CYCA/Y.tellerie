import { Inject, Injectable } from '@nestjs/common';
import {
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '@/auth/application/ports';
import { Email, UserAggregate, UserFactory } from '@/auth/domain';
import { Role } from '@/shared/model';

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
    phoneNumber: string;
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
        phoneNumber: command.phoneNumber,
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

import { Inject, Injectable } from '@nestjs/common';
import {
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '@/auth/application/ports';
import { UserAlreadyExistsError } from '@/auth/application/use-cases';
import { Email, UserAggregate, UserFactory } from '@/auth/domain';
import { Role } from '@/shared/model';

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
    phone: string;
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
        phone: command.phone,
        rawPassword: command.rawPassword,
      },
      this.passwordHasher,
      Role.PERSONNEL,
    );

    await this.userRepository.save(user);

    return user;
  }
}

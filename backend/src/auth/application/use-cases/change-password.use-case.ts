import { Inject, Injectable } from '@nestjs/common';
import {
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
} from '../ports/password-hasher.port';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '../ports/user-repository.port';
import { UserId } from '../../domain/user-id.vo';
import { Password } from '../../domain/password.vo';

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} not found.`);
  }
}

export class InvalidOldPasswordError extends Error {
  constructor() {
    super('The old password does not match.');
  }
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasherSymbol)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: {
    userId: UserId;
    oldPassword: Password;
    newPassword: Password;
  }): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId.toString());
    }

    const isOldPasswordValid = await this.passwordHasher.compare(
      command.oldPassword.toString(),
      user.getProperties().passwordHash,
    );
    if (!isOldPasswordValid) {
      throw new InvalidOldPasswordError();
    }

    const newPasswordHash = await this.passwordHasher.hash(
      command.newPassword.toString(),
    );
    user.changePassword(newPasswordHash);

    await this.userRepository.save(user);
  }
}

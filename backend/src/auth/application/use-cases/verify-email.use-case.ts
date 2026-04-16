import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '../ports/user-repository.port';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(token: string): Promise<void> {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      throw new BadRequestException('Verification token is required.');
    }

    const user = await this.userRepository.findByVerifyEmailToken(
      normalizedToken,
    );

    if (!user) {
      throw new BadRequestException('Invalid verification token.');
    }

    user.verifyEmail();
    await this.userRepository.save(user);
  }
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '@/auth/application/ports';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(token: string): Promise<void> {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      throw new BadRequestException('Le jeton de verification est requis.');
    }

    const user = await this.userRepository.findByVerifyEmailToken(
      normalizedToken,
    );

    if (!user) {
      throw new BadRequestException('Le jeton de verification est invalide.');
    }

    user.verifyEmail();
    await this.userRepository.save(user);
  }
}

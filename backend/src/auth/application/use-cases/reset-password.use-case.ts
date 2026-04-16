import { createHash } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
  IPasswordResetTokenRepository,
  IPasswordResetTokenRepository as IPasswordResetTokenRepositorySymbol,
} from '@/auth/application/ports';
import { Password } from '@/auth/domain';

export class InvalidPasswordResetTokenError extends Error {
  constructor() {
    super('Invalid or expired password reset token.');
  }
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordResetTokenRepositorySymbol)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @Inject(IPasswordHasherSymbol)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: { token: string; password: Password }): Promise<void> {
    const tokenHash = createHash('sha256').update(command.token).digest('hex');
    const resetToken =
      await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken || !resetToken.canBeUsed()) {
      throw new InvalidPasswordResetTokenError();
    }

    const user = await this.userRepository.findById(
      resetToken.getProperties().userId,
    );
    if (!user) {
      throw new InvalidPasswordResetTokenError();
    }

    const newPasswordHash = await this.passwordHasher.hash(
      command.password.toString(),
    );

    user.changePassword(newPasswordHash);
    resetToken.markUsed();

    await this.userRepository.save(user);
    await this.passwordResetTokenRepository.save(resetToken);
  }
}

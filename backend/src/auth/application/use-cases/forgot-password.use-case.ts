import { createHash, randomBytes } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendTransactionalEmailUseCase } from '../../../mailjet/application/use-cases/send-transactional-email.use-case';
import { Email } from '../../domain/email.vo';
import {
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '../ports/user-repository.port';
import { PasswordResetToken } from '../../domain/password-reset-token.entity';
import {
  IPasswordResetTokenRepository,
  IPasswordResetTokenRepository as IPasswordResetTokenRepositorySymbol,
} from '../ports/password-reset-token-repository.port';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordResetTokenRepositorySymbol)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly sendTransactionalEmailUseCase: SendTransactionalEmailUseCase,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: { email: Email }): Promise<void> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      return;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const resetToken = PasswordResetToken.create(
      user.getProperties().id,
      tokenHash,
      1,
    );

    await this.passwordResetTokenRepository.save(resetToken);

    const frontendBaseUrl =
      this.configService.get<string>('app.frontendBaseUrl') ??
      'http://localhost:4200';
    const resetUrl = `${frontendBaseUrl}/reinitialiser-mot-de-passe?token=${encodeURIComponent(rawToken)}`;
    const userProps = user.getProperties();

    await this.sendTransactionalEmailUseCase.execute({
      to: {
        email: userProps.email.toString(),
        name: `${userProps.firstname} ${userProps.lastname}`.trim(),
      },
      subject: 'Reinitialisation de votre mot de passe',
      text: `Bonjour ${userProps.firstname},\n\nUtilisez ce lien pour reinitialiser votre mot de passe : ${resetUrl}\n\nCe lien expire dans 1 heure.`,
      html: `<p>Bonjour ${userProps.firstname},</p><p>Utilisez ce lien pour reinitialiser votre mot de passe :</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Ce lien expire dans 1 heure.</p>`,
    });
  }
}

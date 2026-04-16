import { createHash, randomBytes } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendTransactionalEmailUseCase } from '../../../mailjet/application/use-cases/send-transactional-email.use-case';
import {
  buildActionEmailHtml,
  buildActionEmailText,
} from '../../../mailjet/application/templates/action-email.template';
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
    const recipientName = `${userProps.firstname} ${userProps.lastname}`.trim();
    const templateParams = {
      recipientName,
      preheader: 'Reinitialisation du mot de passe',
      title: 'Choisissez un nouveau mot de passe',
      intro: 'Une demande de reinitialisation de mot de passe a ete recue pour votre compte Ytellerie.',
      body: 'Utilisez le lien ci-dessous pour definir un nouveau mot de passe. Ce lien expire dans 1 heure.',
      ctaLabel: 'Reinitialiser mon mot de passe',
      actionUrl: resetUrl,
      footerNote:
        "Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.",
    };

    await this.sendTransactionalEmailUseCase.execute({
      to: {
        email: userProps.email.toString(),
        name: recipientName,
      },
      subject: 'Reinitialisation de votre mot de passe',
      text: buildActionEmailText(templateParams),
      html: buildActionEmailHtml(templateParams),
    });
  }
}

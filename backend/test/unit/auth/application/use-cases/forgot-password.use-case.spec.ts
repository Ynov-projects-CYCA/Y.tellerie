import { ConfigService } from '@nestjs/config';
import { ForgotPasswordUseCase } from '../../../../../src/auth/application/use-cases/forgot-password.use-case';
import { IUserRepository } from '../../../../../src/auth/application/ports/user-repository.port';
import { IPasswordResetTokenRepository } from '../../../../../src/auth/application/ports/password-reset-token-repository.port';
import { SendTransactionalEmailUseCase } from '../../../../../src/mailjet/application/use-cases/send-transactional-email.use-case';
import { Email } from '../../../../../src/auth/domain/email.vo';
import { UserAggregate } from '../../../../../src/auth/domain/user.aggregate';
import { UserId } from '../../../../../src/auth/domain/user-id.vo';
import { Role } from '../../../../../src/auth/domain/role.vo';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepository: IUserRepository;
  let tokenRepository: IPasswordResetTokenRepository;
  let emailUseCase: Pick<SendTransactionalEmailUseCase, 'execute'>;
  let configService: Pick<ConfigService, 'get'>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    tokenRepository = {
      save: jest.fn(),
      findByTokenHash: jest.fn(),
    };
    emailUseCase = {
      execute: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue('http://localhost:4200'),
    };

    useCase = new ForgotPasswordUseCase(
      userRepository,
      tokenRepository,
      emailUseCase as SendTransactionalEmailUseCase,
      configService as ConfigService,
    );
  });

  it('should do nothing observable when the user does not exist', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await useCase.execute({ email: Email.from('missing@example.com') });

    expect(tokenRepository.save).not.toHaveBeenCalled();
    expect(emailUseCase.execute).not.toHaveBeenCalled();
  });

  it('should persist a token and send an email when the user exists', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(
      new UserAggregate({
        id: UserId.generate(),
        firstname: 'John',
        lastname: 'Doe',
        email: Email.from('john.doe@example.com'),
        phone: '+33123456789',
        passwordHash: 'hashed_password',
        roles: [Role.CLIENT],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await useCase.execute({ email: Email.from('john.doe@example.com') });

    expect(tokenRepository.save).toHaveBeenCalledTimes(1);
    expect(emailUseCase.execute).toHaveBeenCalledTimes(1);
    expect((emailUseCase.execute as jest.Mock).mock.calls[0][0].html).toContain(
      'reinitialiser-mot-de-passe?token=',
    );
  });
});

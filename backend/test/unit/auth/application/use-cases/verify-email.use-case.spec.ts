import { BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../../../../src/auth/application/ports/user-repository.port';
import { VerifyEmailUseCase } from '../../../../../src/auth/application/use-cases/verify-email.use-case';
import { Email } from '../../../../../src/auth/domain/email.vo';
import { Role } from '../../../../../src/auth/domain/role.vo';
import { UserAggregate } from '../../../../../src/auth/domain/user.aggregate';
import { UserId } from '../../../../../src/auth/domain/user-id.vo';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByVerifyEmailToken: jest.fn(),
    };

    useCase = new VerifyEmailUseCase(mockUserRepository);
  });

  it('should verify the email and clear the token', async () => {
    const user = new UserAggregate({
      id: UserId.generate(),
      firstname: 'John',
      lastname: 'Doe',
      phoneNumber: '+33612345678',
      isActive: false,
      verifyEmailToken: 'verify-token',
      resetPasswordToken: null,
      email: Email.from('john.doe@example.com'),
      passwordHash: 'hashed_password',
      roles: [Role.CLIENT],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockUserRepository.findByVerifyEmailToken as jest.Mock).mockResolvedValue(
      user,
    );

    await useCase.execute('verify-token');

    expect(mockUserRepository.findByVerifyEmailToken).toHaveBeenCalledWith(
      'verify-token',
    );
    expect(user.getProperties().isActive).toBe(true);
    expect(user.getProperties().verifyEmailToken).toBeNull();
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });

  it('should throw when the token is missing', async () => {
    await expect(useCase.execute('   ')).rejects.toThrow(BadRequestException);
    expect(mockUserRepository.findByVerifyEmailToken).not.toHaveBeenCalled();
  });

  it('should throw when the token is invalid', async () => {
    (mockUserRepository.findByVerifyEmailToken as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(useCase.execute('invalid-token')).rejects.toThrow(
      BadRequestException,
    );
  });
});

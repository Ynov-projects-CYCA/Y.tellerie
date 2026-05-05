import { BadRequestException } from '@nestjs/common';
import {
  Email,
  IUserRepository,
  Role,
  UserAggregate,
  UserId,
  VerifyEmailUseCase,
} from '../../../../../src/auth';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByVerifyEmailToken: jest.fn(),
      delete: jest.fn(),
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
      phone: '+33123456789',
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

import { RegisterPersonnelUseCase } from '../../../../../src/auth/application/use-cases/register-personnel.use-case';
import { UserAlreadyExistsError } from '../../../../../src/auth/application/use-cases/register-client.use-case';
import { IUserRepository } from '../../../../../src/auth/application/ports/user-repository.port';
import { IPasswordHasher } from '../../../../../src/auth/application/ports/password-hasher.port';
import { Email } from '../../../../../src/auth/domain/email.vo';
import { Role } from '../../../../../src/auth/domain/role.vo';
import { UserAggregate } from '../../../../../src/auth/domain/user.aggregate';
import { UserProperties } from '../../../../../src/auth/domain/user.entity';
import { UserId } from '../../../../../src/auth/domain/user-id.vo';

describe('RegisterPersonnelUseCase', () => {
  let registerPersonnelUseCase: RegisterPersonnelUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: IPasswordHasher;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };
    mockPasswordHasher = {
      hash: jest.fn().mockResolvedValue('hashed_password'),
      compare: jest.fn().mockResolvedValue(true),
    };
    registerPersonnelUseCase = new RegisterPersonnelUseCase(mockUserRepository, mockPasswordHasher);
  });

  it('should register a new personnel successfully', async () => {
    const email = Email.from('new.personnel@example.com');
    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    const command = {
      firstname: 'New',
      lastname: 'Personnel',
      phoneNumber: '+33612345678',
      email: email,
      rawPassword: 'password123',
    };

    const result = await registerPersonnelUseCase.execute(command);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(result).toBeInstanceOf(UserAggregate);
    expect(result.getProperties().roles).toEqual([Role.PERSONNEL]);
  });

  it('should throw UserAlreadyExistsError if user already exists', async () => {
    const email = Email.from('existing.personnel@example.com');
    const existingUserProps: UserProperties = {
      id: UserId.generate(),
      firstname: 'Existing',
      lastname: 'Personnel',
      phoneNumber: '+33612345678',
      email: email,
      passwordHash: 'hashed_password',
      roles: [Role.PERSONNEL],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const existingUser = new UserAggregate(existingUserProps);
    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

    const command = {
      firstname: 'Existing',
      lastname: 'Personnel',
      phoneNumber: '+33612345678',
      email: email,
      rawPassword: 'password123',
    };

    await expect(registerPersonnelUseCase.execute(command)).rejects.toThrow(UserAlreadyExistsError);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});

import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserId, Email, UserAggregate } from '@/auth/domain';
import { IUserRepository } from '@/auth/application/ports/user-repository.port';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, data: {
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
    phone?: string;
    email?: string;
  }): Promise<UserAggregate> {
    const user = await this.userRepository.findById(UserId.from(userId));
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const updateData: any = { ...data };

    if (data.email) {
      const newEmail = Email.from(data.email);
      const currentEmail = user.getProperties().email;

      if (!newEmail.equals(currentEmail)) {
        const existingUser = await this.userRepository.findByEmail(newEmail);
        if (existingUser) {
          throw new ConflictException('Cet e-mail est déjà utilisé par un autre compte');
        }
        updateData.email = newEmail;
      } else {
        delete updateData.email;
      }
    }

    user.updateProfile(updateData);
    await this.userRepository.save(user);
    
    return user;
  }
}

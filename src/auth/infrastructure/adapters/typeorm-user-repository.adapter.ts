import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../application/ports/user-repository.port';
import { UserAggregate } from '../../../domain/user.aggregate';
import { User } from '../../../domain/user.entity';
import { UserId } from '../../../domain/user-id.vo';
import { Email } from '../../../domain/email.vo';
import { UserFactory } from '../../../domain/user.factory';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async save(user: UserAggregate): Promise<void> {
    const userProps = user.getProperties();
    // The schema and its transformers will handle the conversion of VOs.
    await this.userRepository.save(userProps);
  }

  async findById(id: UserId): Promise<UserAggregate | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    // Reconstitute the aggregate from the plain object from the DB
    return UserFactory.reconstitute(user);
  }

  async findByEmail(email: Email): Promise<UserAggregate | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return UserFactory.reconstitute(user);
  }
}

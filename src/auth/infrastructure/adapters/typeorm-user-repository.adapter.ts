import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../application/ports/user-repository.port';
import { UserAggregate } from '../../domain/user.aggregate';
import { UserId } from '../../domain/user-id.vo';
import { Email } from '../../domain/email.vo';
import { UserFactory } from '../../domain/user.factory';
import { UserOrmEntity, UserSchema } from '../persistence/typeorm/user.schema';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async save(user: UserAggregate): Promise<void> {
    const userProps = user.getProperties();
    const userOrmEntity: UserOrmEntity = {
      id: userProps.id.toString(),
      firstname: userProps.firstname,
      lastname: userProps.lastname,
      email: userProps.email.toString(),
      passwordHash: userProps.passwordHash,
      roles: userProps.roles,
      createdAt: userProps.createdAt,
      updatedAt: userProps.updatedAt,
    };
    await this.userRepository.save(userOrmEntity);
  }

  async findById(id: UserId): Promise<UserAggregate | null> {
    const userOrmEntity = await this.userRepository.findOne({
      where: { id: id.toString() },
    });
    if (!userOrmEntity) {
      return null;
    }
    return UserFactory.reconstitute({
      id: UserId.from(userOrmEntity.id),
      firstname: userOrmEntity.firstname,
      lastname: userOrmEntity.lastname,
      email: Email.from(userOrmEntity.email),
      passwordHash: userOrmEntity.passwordHash,
      roles: userOrmEntity.roles,
      createdAt: userOrmEntity.createdAt,
      updatedAt: userOrmEntity.updatedAt,
    });
  }

  async findByEmail(email: Email): Promise<UserAggregate | null> {
    const userOrmEntity = await this.userRepository.findOne({
      where: { email: email.toString() },
    });
    if (!userOrmEntity) {
      return null;
    }
    return UserFactory.reconstitute({
      id: UserId.from(userOrmEntity.id),
      firstname: userOrmEntity.firstname,
      lastname: userOrmEntity.lastname,
      email: Email.from(userOrmEntity.email),
      passwordHash: userOrmEntity.passwordHash,
      roles: userOrmEntity.roles,
      createdAt: userOrmEntity.createdAt,
      updatedAt: userOrmEntity.updatedAt,
    });
  }
}

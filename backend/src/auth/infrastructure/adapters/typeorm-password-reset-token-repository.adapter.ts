import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPasswordResetTokenRepository } from '../../application/ports/password-reset-token-repository.port';
import { PasswordResetToken } from '../../domain/password-reset-token.entity';
import { UserId } from '../../domain/user-id.vo';
import {
  PasswordResetTokenOrmEntity,
  PasswordResetTokenSchema,
} from '../persistence/typeorm/password-reset-token.schema';

@Injectable()
export class TypeOrmPasswordResetTokenRepository
  implements IPasswordResetTokenRepository
{
  constructor(
    @InjectRepository(PasswordResetTokenSchema)
    private readonly repository: Repository<PasswordResetTokenOrmEntity>,
  ) {}

  async save(token: PasswordResetToken): Promise<void> {
    const props = token.getProperties();

    await this.repository.save({
      id: props.id,
      userId: props.userId.toString(),
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
      usedAt: props.usedAt,
      createdAt: props.createdAt,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const entity = await this.repository.findOne({
      where: { tokenHash },
    });

    if (!entity) {
      return null;
    }

    return new PasswordResetToken({
      id: entity.id,
      userId: UserId.from(entity.userId),
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      usedAt: entity.usedAt,
      createdAt: entity.createdAt,
    });
  }
}

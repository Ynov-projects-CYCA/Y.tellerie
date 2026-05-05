import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '@/auth/domain/refresh-token.entity';
import { UserId } from '@/auth/domain';
import { IRefreshTokenRepository } from '@/auth/application/ports/refresh-token-repository.port';
import { RefreshTokenSchema } from '../persistence/typeorm/refresh-token.schema';
import { RefreshTokenProperties } from '@/shared/model';

@Injectable()
export class TypeOrmRefreshTokenRepositoryAdapter implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenSchema)
    private readonly repository: Repository<RefreshTokenProperties>,
  ) {}

  async save(refreshToken: RefreshToken): Promise<void> {
    const props = refreshToken.getProperties();
    await this.repository.save({
      ...props,
      userId: props.userId.toString(),
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const props = await this.repository.findOne({ where: { token } });
    if (!props) return null;

    return new RefreshToken({
      ...props,
      userId: UserId.from(props.userId as unknown as string),
    });
  }

  async deleteByUserId(userId: UserId): Promise<void> {
    await this.repository.delete({ userId: userId.toString() });
  }
}

import { randomUUID } from 'crypto';
import { UserId } from './user-id.vo';
import { RefreshTokenProperties } from '@/shared/model';

export class RefreshToken {
  constructor(private readonly properties: RefreshTokenProperties) {}

  static create(
    userId: UserId,
    token: string,
    lifetimeInDays: number,
  ): RefreshToken {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + lifetimeInDays);

    return new RefreshToken({
      id: randomUUID(),
      userId,
      token,
      expiresAt,
      isRevoked: false,
      createdAt,
    });
  }

  getProperties(): RefreshTokenProperties {
    return { ...this.properties };
  }

  isExpired(referenceDate: Date = new Date()): boolean {
    return this.properties.expiresAt.getTime() <= referenceDate.getTime();
  }

  isValid(referenceDate: Date = new Date()): boolean {
    return !this.properties.isRevoked && !this.isExpired(referenceDate);
  }

  revoke(): void {
    this.properties.isRevoked = true;
  }
}

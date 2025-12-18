import { UserId } from './user-id.vo';
import { randomUUID } from 'crypto';

export interface RefreshTokenProperties {
  id: string;
  userId: UserId;
  expiresAt: Date;
  isRevoked: boolean;
}

export class RefreshToken {
  private readonly id: string;
  private readonly userId: UserId;
  private readonly expiresAt: Date;
  private isRevoked: boolean;

  constructor(properties: RefreshTokenProperties) {
    Object.assign(this, properties);
  }

  public static create(userId: UserId, tokenLifetimeDays: number): RefreshToken {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + tokenLifetimeDays);

    return new RefreshToken({
      id: randomUUID(),
      userId,
      expiresAt,
      isRevoked: false,
    });
  }

  public getProperties(): RefreshTokenProperties {
    return {
      id: this.id,
      userId: this.userId,
      expiresAt: this.expiresAt,
      isRevoked: this.isRevoked,
    };
  }

  public revoke() {
    this.isRevoked = true;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

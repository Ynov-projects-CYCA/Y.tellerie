import { randomUUID } from 'crypto';
import { UserId } from './user-id.vo';

export interface PasswordResetTokenProperties {
  id: string;
  userId: UserId;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export class PasswordResetToken {
  constructor(private readonly properties: PasswordResetTokenProperties) {}

  static create(
    userId: UserId,
    tokenHash: string,
    lifetimeInHours: number,
  ): PasswordResetToken {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setHours(expiresAt.getHours() + lifetimeInHours);

    return new PasswordResetToken({
      id: randomUUID(),
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt,
    });
  }

  getProperties(): PasswordResetTokenProperties {
    return {
      id: this.properties.id,
      userId: this.properties.userId,
      tokenHash: this.properties.tokenHash,
      expiresAt: this.properties.expiresAt,
      usedAt: this.properties.usedAt,
      createdAt: this.properties.createdAt,
    };
  }

  isExpired(referenceDate: Date = new Date()): boolean {
    return this.properties.expiresAt.getTime() <= referenceDate.getTime();
  }

  isUsed(): boolean {
    return this.properties.usedAt !== null;
  }

  canBeUsed(referenceDate: Date = new Date()): boolean {
    return !this.isUsed() && !this.isExpired(referenceDate);
  }

  markUsed(usedAt: Date = new Date()): void {
    this.properties.usedAt = usedAt;
  }
}

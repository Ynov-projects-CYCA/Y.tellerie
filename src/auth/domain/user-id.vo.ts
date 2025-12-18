import { randomUUID } from 'crypto';

export class UserId {
  private constructor(private readonly value: string) {}

  public static generate(): UserId {
    return new UserId(randomUUID());
  }

  public static from(value: string): UserId {
    // We could add UUID validation here if needed
    return new UserId(value);
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

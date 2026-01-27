import {
  IsNotEmpty,
  IsString,
  MinLength,
  validateSync,
  ValidationError,
} from 'class-validator';

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

export class Password {
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new InvalidPasswordError(this.formatErrors(errors));
    }
  }

  public static from(value: string): Password {
    return new Password(value);
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Password): boolean {
    return this.value === other.value;
  }

  private formatErrors(errors: ValidationError[]): string {
    return errors
      .map((err) => Object.values(err.constraints ?? {}).join(', '))
      .join(', ');
  }
}

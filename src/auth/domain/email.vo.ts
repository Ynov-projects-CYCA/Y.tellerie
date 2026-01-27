import {
  IsEmail,
  IsNotEmpty,
  validateSync,
  ValidationError,
} from 'class-validator';

export class InvalidEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEmailError';
  }
}

export class Email {
  @IsEmail()
  @IsNotEmpty()
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new InvalidEmailError(this.formatErrors(errors));
    }
  }

  public static from(value: string): Email {
    return new Email(value);
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  private formatErrors(errors: ValidationError[]): string {
    return errors
      .map((err) => Object.values(err.constraints ?? {}).join(', '))
      .join(', ');
  }
}

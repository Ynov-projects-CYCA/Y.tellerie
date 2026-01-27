import { Email, InvalidEmailError } from '../../../../src/auth/domain/email.vo';

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const emailString = 'test@example.com';
    const email = Email.from(emailString);
    expect(email).toBeInstanceOf(Email);
    expect(email.toString()).toBe(emailString);
  });

  it('should throw an error for an invalid email', () => {
    const invalidEmailString = 'not-an-email';
    expect(() => Email.from(invalidEmailString)).toThrow(InvalidEmailError);
  });

  it('should throw an error for an empty email', () => {
    expect(() => Email.from('')).toThrow(InvalidEmailError);
  });

  it('should correctly compare two equal emails', () => {
    const email1 = Email.from('test@example.com');
    const email2 = Email.from('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });

  it('should correctly compare two different emails', () => {
    const email1 = Email.from('test1@example.com');
    const email2 = Email.from('test2@example.com');
    expect(email1.equals(email2)).toBe(false);
  });
});

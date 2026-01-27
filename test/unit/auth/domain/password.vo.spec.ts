import { Password, InvalidPasswordError } from '../../../../src/auth/domain/password.vo';

describe('Password Value Object', () => {
  it('should create a valid password', () => {
    const passwordString = 'Password123!';
    const password = Password.from(passwordString);
    expect(password).toBeInstanceOf(Password);
    expect(password.toString()).toBe(passwordString);
  });

  it('should throw an error for a password that is too short', () => {
    const shortPassword = 'short';
    expect(() => Password.from(shortPassword)).toThrow(InvalidPasswordError);
  });

  it('should throw an error for an empty password', () => {
    expect(() => Password.from('')).toThrow(InvalidPasswordError);
  });

  it('should correctly compare two equal passwords', () => {
    const password_1 = Password.from('Password123!');
    const password_2 = Password.from('Password123!');
    expect(password_1.equals(password_2)).toBe(true);
  });

  it('should correctly compare two different passwords', () => {
    const password_1 = Password.from('Password123!');
    const password_2 = Password.from('Different123!');
    expect(password_1.equals(password_2)).toBe(false);
  });
});

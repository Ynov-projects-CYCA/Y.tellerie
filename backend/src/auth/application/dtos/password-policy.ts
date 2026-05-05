import { Matches, MinLength } from 'class-validator';

export const PASSWORD_POLICY_MESSAGE =
  'Le mot de passe doit contenir au moins 8 caracteres, une majuscule, un chiffre et un caractere special.';

export function StrongPassword(): PropertyDecorator {
  return (target, propertyKey) => {
    MinLength(8, { message: PASSWORD_POLICY_MESSAGE })(target, propertyKey as string);
    Matches(/[A-Z]/, {
      message: PASSWORD_POLICY_MESSAGE,
    })(target, propertyKey as string);
    Matches(/\d/, {
      message: PASSWORD_POLICY_MESSAGE,
    })(target, propertyKey as string);
    Matches(/[^A-Za-z0-9]/, {
      message: PASSWORD_POLICY_MESSAGE,
    })(target, propertyKey as string);
  };
}

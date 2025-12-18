import { UserAggregate } from './user.aggregate';
import { UserId } from './user-id.vo';
import { Email } from './email.vo';
import { Role } from './role.vo';
import { UserProperties } from './user.entity';

// The IPasswordHasher is a port defined in the application layer.
// We are referencing it here to show the dependency of the domain factory
// on an external service for password hashing.
export interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

export class UserFactory {
  public static async create(
    properties: {
      firstname: string;
      lastname: string;
      email: Email;
      rawPassword: string;
    },
    passwordHasher: IPasswordHasher,
  ): Promise<UserAggregate> {
    const userProps: UserProperties = {
      id: UserId.generate(),
      firstname: properties.firstname,
      lastname: properties.lastname,
      email: properties.email,
      passwordHash: await passwordHasher.hash(properties.rawPassword),
      roles: [Role.USER], // Default role
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new UserAggregate(userProps);
  }

  public static reconstitute(properties: UserProperties): UserAggregate {
    return new UserAggregate(properties);
  }
}

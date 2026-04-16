import { randomUUID } from 'crypto';
import { UserAggregate } from './user.aggregate';
import { UserId } from './user-id.vo';
import { Email } from './email.vo';
import { Role } from './role.vo';
import { UserProperties } from './user.entity';

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

export class UserFactory {
  public static async create(
    properties: {
      firstname: string;
      lastname: string;
      phoneNumber: string;
      email: Email;
      phone: string;
      rawPassword: string;
    },
    passwordHasher: IPasswordHasher,
    initialRole: Role = Role.CLIENT,
  ): Promise<UserAggregate> {
    const userProps: UserProperties = {
      id: UserId.generate(),
      firstname: properties.firstname,
      lastname: properties.lastname,
      phoneNumber: properties.phoneNumber,
      isActive: false,
      verifyEmailToken: randomUUID(),
      resetPasswordToken: null,
      email: properties.email,
      phone: properties.phone,
      passwordHash: await passwordHasher.hash(properties.rawPassword),
      roles: [initialRole],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new UserAggregate(userProps);
  }

  public static reconstitute(properties: UserProperties): UserAggregate {
    return new UserAggregate(properties);
  }
}

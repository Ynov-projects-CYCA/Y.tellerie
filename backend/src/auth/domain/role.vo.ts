import { Role } from '@/shared/model';

export { Role };

export class Roles {
  private constructor(private readonly values: Role[]) {}

  public static from(roles: Role[]): Roles {
    if (!roles || roles.length === 0) {
      // Un compte sans role explicite reste client par defaut.
      return new Roles([Role.CLIENT]);
    }
    return new Roles(roles);
  }

  public has(role: Role): boolean {
    return this.values.includes(role);
  }

  public getValues(): Role[] {
    return this.values;
  }
}

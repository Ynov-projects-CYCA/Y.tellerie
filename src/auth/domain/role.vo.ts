export enum Role {
  CLIENT = 'client',
  PERSONNEL = 'personnel',
}

export class Roles {
  private constructor(private readonly values: Role[]) {}

  public static from(roles: Role[]): Roles {
    if (!roles || roles.length === 0) {
      // Default role if none provided
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

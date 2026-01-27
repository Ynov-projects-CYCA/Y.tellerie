import { Role, Roles } from '../../../../src/auth/domain/role.vo';

describe('Role', () => {
  it('should have CLIENT and PERSONNEL roles', () => {
    expect(Role.CLIENT).toBe('client');
    expect(Role.PERSONNEL).toBe('personnel');
  });
});

describe('Roles', () => {
  it('should create Roles from an array of strings', () => {
    const roles = Roles.from([Role.CLIENT, Role.PERSONNEL]);
    expect(roles.getValues()).toEqual([Role.CLIENT, Role.PERSONNEL]);
  });

  it('should default to CLIENT role if no roles are provided', () => {
    const roles = Roles.from([]);
    expect(roles.getValues()).toEqual([Role.CLIENT]);
  });

  it('should correctly check if a role is present', () => {
    const roles = Roles.from([Role.CLIENT]);
    expect(roles.has(Role.CLIENT)).toBe(true);
    expect(roles.has(Role.PERSONNEL)).toBe(false);
  });

  it('should return all roles as an array', () => {
    const roles = Roles.from([Role.CLIENT, Role.PERSONNEL]);
    expect(roles.getValues()).toEqual([Role.CLIENT, Role.PERSONNEL]);
  });
});

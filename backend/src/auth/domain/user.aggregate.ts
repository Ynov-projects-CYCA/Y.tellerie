import { User } from './user.entity';
import { Role } from './role.vo';

/**
 * In this domain, the User is the aggregate root.
 * An aggregate is a cluster of domain objects that can be treated as a single unit.
 * The UserAggregate encapsulates the User entity and could also include related
 * objects that are managed as part of the same transactional consistency boundary.
 *
 * For now, our aggregate is simple and is a direct wrapper around the User entity.
 */
export class UserAggregate extends User {
  addRole(role: Role) {
    if (!this.getProperties().roles.includes(role)) {
      this.getProperties().roles.push(role);
    }
  }
}

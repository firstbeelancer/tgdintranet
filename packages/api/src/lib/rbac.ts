import type { UserRole } from '../db/schema.js';

const ROLE_LEVEL: Record<UserRole, number> = {
  user: 1,
  marketer: 2,
  admin: 3,
};

export function roleAtLeast(role: UserRole, required: UserRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[required];
}

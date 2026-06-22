import type { UserRole } from '../db/schema.js';

// Иерархия ролей: admin > marketer > user
// admin имеет доступ ко всему
// marketer имеет доступ к user-уровню + маркетинговые фичи
// user имеет доступ только к user-уровню

const ROLE_LEVEL: Record<UserRole, number> = {
  user: 1,
  marketer: 2,
  admin: 3,
};

export function roleAtLeast(role: UserRole, required: UserRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[required];
}

// Проверяет, виден ли контент с минимальной ролью `visibleTo` пользователю с ролью `userRole`
export function canViewContent(userRole: UserRole, visibleTo: UserRole): boolean {
  return roleAtLeast(userRole, visibleTo);
}

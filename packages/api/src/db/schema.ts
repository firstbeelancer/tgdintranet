import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  date,
  pgEnum,
  varchar,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── ENUMS ───────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['admin', 'marketer', 'user']);
export const serviceCategoryEnum = pgEnum('service_category', [
  'marketing',
  'hr',
  'development',
  'documents',
  'communication',
  'analytics',
  'other',
]);

// ─── USERS ───────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 256 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name').notNull(),
    role: userRoleEnum('role').notNull().default('user'),
    position: text('position'),
    department: text('department'),
    phone: varchar('phone', { length: 64 }),
    birthday: date('birthday'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
    roleIdx: index('users_role_idx').on(t.role),
  }),
);

// ─── ANNOUNCEMENTS (главная лента) ─────────────────────────────

export const announcements = pgTable(
  'announcements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    audience: userRoleEnum('audience').notNull().default('user'), // минимальная роль, которая видит
    isPinned: boolean('is_pinned').notNull().default(false),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'set null' }),
  },
  (t) => ({
    publishedIdx: index('announcements_published_idx').on(t.publishedAt),
    audienceIdx: index('announcements_audience_idx').on(t.audience),
  }),
);

// ─── SERVICES (быстрые ссылки) ─────────────────────────────────

export const services = pgTable(
  'services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    url: text('url').notNull(),
    category: serviceCategoryEnum('category').notNull().default('other'),
    iconName: text('icon_name'), // lucide icon name
    displayOrder: integer('display_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    visibleTo: userRoleEnum('visible_to').notNull().default('user'), // минимальная роль
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orderIdx: index('services_order_idx').on(t.displayOrder),
    categoryIdx: index('services_category_idx').on(t.category),
  }),
);

// ─── EMPLOYEE CONTACTS (карточки сотрудников) ──────────────────

export const employees = pgTable(
  'employees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    fullName: text('full_name').notNull(),
    position: text('position').notNull(),
    department: text('department'),
    email: varchar('email', { length: 256 }),
    phone: varchar('phone', { length: 64 }),
    telegram: varchar('telegram', { length: 64 }),
    birthday: date('birthday'),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    departmentIdx: index('employees_department_idx').on(t.department),
    fullNameIdx: index('employees_fullname_idx').on(t.fullName),
  }),
);

// ─── EMPLOYEE CHILDREN (дети сотрудников — HR) ─────────────────

export const employeeChildren = pgTable('employee_children', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  name: text('name'),
  birthday: date('birthday').notNull(),
  gender: varchar('gender', { length: 8 }).notNull(), // 'male' | 'female'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── FORMS (шаблоны заявлений) ─────────────────────────────────

export const forms = pgTable(
  'forms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    category: text('category').notNull().default('general'),
    fileUrl: text('file_url'), // ссылка на шаблон
    externalUrl: text('external_url'), // или внешняя CRM-ссылка
    downloadCount: integer('download_count').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    visibleTo: userRoleEnum('visible_to').notNull().default('user'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    categoryIdx: index('forms_category_idx').on(t.category),
  }),
);

// ─── KNOWLEDGE BASE PAGES (страницы базы знаний) ──────────────

export const knowledgePages = pgTable(
  'knowledge_pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 128 }).notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    body: text('body').notNull(),
    category: text('category').notNull().default('general'),
    visibleTo: userRoleEnum('visible_to').notNull().default('user'),
    updatedBy: uuid('updated_by')
      .notNull()
      .references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex('knowledge_slug_idx').on(t.slug),
    categoryIdx: index('knowledge_category_idx').on(t.category),
  }),
);

// ─── RELATIONS ──────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  announcements: many(announcements),
  knowledgeUpdates: many(knowledgePages),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, { fields: [employees.userId], references: [users.id] }),
  children: many(employeeChildren),
}));

export const employeeChildrenRelations = relations(employeeChildren, ({ one }) => ({
  employee: one(employees, { fields: [employeeChildren.employeeId], references: [employees.id] }),
}));

// ─── TYPES ──────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type EmployeeChild = typeof employeeChildren.$inferSelect;
export type Form = typeof forms.$inferSelect;
export type KnowledgePage = typeof knowledgePages.$inferSelect;
export type UserRole = (typeof userRoleEnum.enumValues)[number];

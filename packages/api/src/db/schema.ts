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
  'marketing', 'hr', 'development', 'documents', 'communication', 'analytics', 'other',
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

// ─── EMPLOYEES ───────────────────────────────────────────────────

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

// ─── EMPLOYEE CHILDREN ───────────────────────────────────────────

export const employeeChildren = pgTable('employee_children', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  name: text('name'),
  birthday: date('birthday').notNull(),
  gender: varchar('gender', { length: 8 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const employeeChildrenRelations = relations(employeeChildren, ({ one }) => ({
  employee: one(employees, { fields: [employeeChildren.employeeId], references: [employees.id] }),
}));

// ─── Supabase compat tables (для совместимости с UI nexus-flow-team) ─

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name'),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  position: text('position'),
  department: text('department'),
  phone: varchar('phone', { length: 64 }),
  birthday: date('birthday'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 32 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const partnerCertificates = pgTable('partner_certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorName: text('vendor_name').notNull(),
  legalEntity: text('legal_entity'),
  tags: text('tags').array().notNull().default([]),
  partnerStatus: text('partner_status'),
  issuedDate: date('issued_date'),
  expiryDate: date('expiry_date'),
  filePath: text('file_path'),
  discount: text('discount'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const certificateVersions = pgTable('certificate_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificateId: uuid('certificate_id').notNull().references(() => partnerCertificates.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  versionNumber: integer('version_number').notNull().default(1),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

export const successCases = pgTable('success_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  client: text('client'),
  solution: text('solution'),
  result: text('result'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mascotVotes = pgTable('mascot_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  optionId: text('option_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mascotOptions = pgTable('mascot_options', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── TYPES ──────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type EmployeeChild = typeof employeeChildren.$inferSelect;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type Profile = typeof profiles.$inferSelect;
export type UserRoleRow = typeof userRoles.$inferSelect;
export type PartnerCertificate = typeof partnerCertificates.$inferSelect;
export type CertificateVersion = typeof certificateVersions.$inferSelect;
export type SuccessCase = typeof successCases.$inferSelect;
export type MascotVote = typeof mascotVotes.$inferSelect;
export type MascotOption = typeof mascotOptions.$inferSelect;

// ─── Original (Lovable prototype) tables (basic versions for prototype) ───

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  audience: varchar('audience', { length: 32 }).notNull().default('user'),
  isPinned: boolean('is_pinned').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  category: varchar('category', { length: 64 }).notNull().default('other'),
  iconName: text('icon_name'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  visibleTo: varchar('visible_to', { length: 32 }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull().default('general'),
  fileUrl: text('file_url'),
  externalUrl: text('external_url'),
  downloadCount: integer('download_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  visibleTo: varchar('visible_to', { length: 32 }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const knowledgePages = pgTable('knowledge_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary'),
  body: text('body').notNull(),
  category: text('category').notNull().default('general'),
  visibleTo: varchar('visible_to', { length: 32 }).notNull().default('user'),
  updatedBy: uuid('updated_by').notNull().references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Announcement = typeof announcements.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Form = typeof forms.$inferSelect;
export type KnowledgePage = typeof knowledgePages.$inferSelect;

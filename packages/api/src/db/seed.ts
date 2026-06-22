import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { db, schema } from './index.js';
import { getEnv } from '../config/env.js';

const ARGON_OPTS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

async function upsertUser(args: {
  email: string;
  password: string;
  displayName: string;
  role: schema.UserRole;
  position?: string;
  department?: string;
}) {
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, args.email)).limit(1);
  if (existing.length > 0) {
    console.log(`  · user ${args.email} already exists — skipping`);
    return existing[0];
  }
  const passwordHash = await hash(args.password, ARGON_OPTS);
  const [created] = await db
    .insert(schema.users)
    .values({
      email: args.email,
      passwordHash,
      displayName: args.displayName,
      role: args.role,
      position: args.position,
      department: args.department,
    })
    .returning();
  console.log(`  ✓ created ${args.role}: ${args.email}`);

  // Create profile row (for UI's supabase.from('profiles'))
  await db.insert(schema.profiles).values({
    userId: created.id,
    displayName: args.displayName,
    email: args.email,
    position: args.position ?? null,
    department: args.department ?? null,
  }).onConflictDoNothing();

  // Create user_role row
  await db.insert(schema.userRoles).values({
    userId: created.id,
    role: args.role,
  });

  return created;
}

async function main() {
  const env = getEnv();
  console.log('🌱 Seeding tgdintranet...');

  const adminPwd = process.env.SEED_ADMIN_PASSWORD || 'Admin2026!Demo';
  const marketerPwd = process.env.SEED_MARKETER_PASSWORD || 'Marketer2026!Demo';
  const userPwd = process.env.SEED_USER_PASSWORD || 'User2026!Demo';
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@intranet.local';
  const marketerEmail = process.env.SEED_MARKETER_EMAIL || 'marketer@intranet.local';
  const userEmail = process.env.SEED_USER_EMAIL || 'user@intranet.local';

  const admin = await upsertUser({
    email: adminEmail, password: adminPwd, displayName: 'Анна Администратор',
    role: 'admin', position: 'Руководитель внутренних сервисов', department: 'Operations',
  });
  const marketer = await upsertUser({
    email: marketerEmail, password: marketerPwd, displayName: 'Мария Маркетолог',
    role: 'marketer', position: 'Старший маркетолог', department: 'Marketing',
  });
  const user = await upsertUser({
    email: userEmail, password: userPwd, displayName: 'Иван Пользователь',
    role: 'user', position: 'Менеджер проектов', department: 'PMO',
  });

  // Employees
  const existingEmployees = await db.select().from(schema.employees);
  if (existingEmployees.length === 0) {
    console.log('  → seeding employees');
    await db.insert(schema.employees).values([
      { userId: admin.id, fullName: admin.displayName, position: admin.position!, department: admin.department, email: admin.email, phone: '+7 (495) 100-00-01', telegram: 'admin_tgd' },
      { userId: marketer.id, fullName: marketer.displayName, position: marketer.position!, department: marketer.department, email: marketer.email, phone: '+7 (495) 100-00-02', telegram: 'marketer_tgd' },
      { userId: user.id, fullName: user.displayName, position: user.position!, department: user.department, email: user.email, phone: '+7 (495) 100-00-03', telegram: 'user_tgd' },
      { fullName: 'Олег Разработчик', position: 'Lead Developer', department: 'Engineering', email: 'oleg.dev@tigerapps.pro', phone: '+7 (495) 100-00-04', telegram: 'oleg_dev' },
      { fullName: 'Елена HR', position: 'HR Business Partner', department: 'HR', email: 'elena.hr@tigerapps.pro', phone: '+7 (495) 100-00-05', telegram: 'elena_hr' },
      { fullName: 'Дмитрий Аналитик', position: 'Data Analyst', department: 'Analytics', email: 'dmitry.analytics@tigerapps.pro', phone: '+7 (495) 100-00-06', telegram: 'dmitry_a' },
    ]);
    console.log('  ✓ seeded employees');
  }

  // Mascot options (4 маскота)
  const existingMascotOpts = await db.select().from(schema.mascotOptions);
  if (existingMascotOpts.length === 0) {
    console.log('  → seeding mascot options');
    await db.insert(schema.mascotOptions).values([
      { id: 'ant', name: 'Муравей', imageUrl: '/mascots/ant.png', description: 'Трудолюбивый и командный' },
      { id: 'octopus', name: 'Осьминог', imageUrl: '/mascots/octopus.png', description: 'Адаптивный и многозадачный' },
      { id: 'orca', name: 'Косатка', imageUrl: '/mascots/orca.png', description: 'Мощный и решительный' },
      { id: 'owl', name: 'Сова', imageUrl: '/mascots/owl.png', description: 'Мудрый и внимательный' },
    ]);
    console.log('  ✓ seeded mascot options');
  }

  console.log('✅ Seed complete');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

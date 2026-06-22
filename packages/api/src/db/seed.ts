import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { db, schema } from './index.js';
import { getEnv } from '../config/env.js';

const ARGON_OPTS = {
  memoryCost: 19_456, // ~19 MB
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
  return created;
}

async function main() {
  const env = getEnv();
  console.log('🌱 Seeding tgdintranet...');

  const admin = await upsertUser({
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    displayName: 'Анна Администратор',
    role: 'admin',
    position: 'Руководитель внутренних сервисов',
    department: 'Operations',
  });

  const marketer = await upsertUser({
    email: env.SEED_MARKETER_EMAIL,
    password: env.SEED_MARKETER_PASSWORD,
    displayName: 'Мария Маркетолог',
    role: 'marketer',
    position: 'Старший маркетолог',
    department: 'Marketing',
  });

  const user = await upsertUser({
    email: env.SEED_USER_EMAIL,
    password: env.SEED_USER_PASSWORD,
    displayName: 'Иван Пользователь',
    role: 'user',
    position: 'Менеджер проектов',
    department: 'PMO',
  });

  // ─── Employees (привязываем к user_id где есть) ────────────────

  const existingEmployees = await db.select().from(schema.employees);
  if (existingEmployees.length === 0) {
    console.log('  → seeding employees');
    await db.insert(schema.employees).values([
      {
        userId: admin.id,
        fullName: admin.displayName,
        position: admin.position!,
        department: admin.department,
        email: admin.email,
        phone: '+7 (495) 100-00-01',
        telegram: 'admin_tgd',
      },
      {
        userId: marketer.id,
        fullName: marketer.displayName,
        position: marketer.position!,
        department: marketer.department,
        email: marketer.email,
        phone: '+7 (495) 100-00-02',
        telegram: 'marketer_tgd',
      },
      {
        userId: user.id,
        fullName: user.displayName,
        position: user.position!,
        department: user.department,
        email: user.email,
        phone: '+7 (495) 100-00-03',
        telegram: 'user_tgd',
      },
      {
        fullName: 'Олег Разработчик',
        position: 'Lead Developer',
        department: 'Engineering',
        email: 'oleg.dev@tigerapps.pro',
        phone: '+7 (495) 100-00-04',
        telegram: 'oleg_dev',
      },
      {
        fullName: 'Елена HR',
        position: 'HR Business Partner',
        department: 'HR',
        email: 'elena.hr@tigerapps.pro',
        phone: '+7 (495) 100-00-05',
        telegram: 'elena_hr',
      },
      {
        fullName: 'Дмитрий Аналитик',
        position: 'Data Analyst',
        department: 'Analytics',
        email: 'dmitry.analytics@tigerapps.pro',
        phone: '+7 (495) 100-00-06',
        telegram: 'dmitry_a',
      },
    ]);
    console.log('  ✓ seeded employees');
  }

  // ─── Services (быстрые ссылки) ────────────────────────────────

  const existingServices = await db.select().from(schema.services);
  if (existingServices.length === 0) {
    console.log('  → seeding services');
    await db.insert(schema.services).values([
      {
        name: 'CRM Bitrix24',
        description: 'Управление клиентами и сделками',
        url: 'https://tigerapps.bitrix24.ru',
        category: 'communication',
        iconName: 'Briefcase',
        displayOrder: 10,
        visibleTo: 'user',
      },
      {
        name: 'GitHub Organization',
        description: 'Репозитории команды и код-ревью',
        url: 'https://github.com/firstbeelancer',
        category: 'development',
        iconName: 'Github',
        displayOrder: 20,
        visibleTo: 'user',
      },
      {
        name: 'Figma Workspace',
        description: 'Дизайн-макеты и прототипы',
        url: 'https://figma.com',
        category: 'marketing',
        iconName: 'Palette',
        displayOrder: 30,
        visibleTo: 'marketer',
      },
      {
        name: 'Яндекс.Метрика',
        description: 'Аналитика маркетинговых кампаний',
        url: 'https://metrika.yandex.ru',
        category: 'analytics',
        iconName: 'BarChart3',
        displayOrder: 40,
        visibleTo: 'marketer',
      },
      {
        name: 'Google Drive',
        description: 'Корпоративные документы и таблицы',
        url: 'https://drive.google.com',
        category: 'documents',
        iconName: 'FolderOpen',
        displayOrder: 50,
        visibleTo: 'user',
      },
      {
        name: 'Notion Wiki',
        description: 'Внутренняя база знаний',
        url: 'https://notion.so',
        category: 'documents',
        iconName: 'BookOpen',
        displayOrder: 60,
        visibleTo: 'user',
      },
      {
        name: '1С: ЗУП',
        description: 'Кадровый учёт и расчёт зарплаты',
        url: 'https://1c.ru',
        category: 'hr',
        iconName: 'Users',
        displayOrder: 70,
        visibleTo: 'admin',
      },
      {
        name: 'Ops Dashboard',
        description: 'Здоровье инфраструктуры',
        url: 'https://infracockpit.tigerapps.pro',
        category: 'analytics',
        iconName: 'Activity',
        displayOrder: 80,
        visibleTo: 'admin',
      },
    ]);
    console.log('  ✓ seeded services');
  }

  // ─── Announcements (объявления) ───────────────────────────────

  const existingAnn = await db.select().from(schema.announcements);
  if (existingAnn.length === 0) {
    console.log('  → seeding announcements');
    await db.insert(schema.announcements).values([
      {
        title: 'Добро пожаловать в корпоративный хаб!',
        body: 'Это новый внутренний портал. Здесь собраны быстрые ссылки на ключевые сервисы, контакты коллег и шаблоны документов. Если что-то не работает или нужны новые разделы — пишите администратору.',
        audience: 'user',
        isPinned: true,
        createdBy: admin.id,
      },
      {
        title: 'Маркетингу: обновить бренд-гайд',
        body: 'К концу недели нужно обновить раздел «Брендбук» — добавить актуальные логотипы и шаблоны для соцсетей.',
        audience: 'marketer',
        isPinned: false,
        createdBy: admin.id,
      },
      {
        title: 'Плановые работы 28.06',
        body: 'С 23:00 до 01:00 возможны кратковременные перебои в работе VPN и CRM.',
        audience: 'user',
        isPinned: false,
        createdBy: admin.id,
      },
    ]);
    console.log('  ✓ seeded announcements');
  }

  // ─── Forms (шаблоны) ──────────────────────────────────────────

  const existingForms = await db.select().from(schema.forms);
  if (existingForms.length === 0) {
    console.log('  → seeding forms');
    await db.insert(schema.forms).values([
      {
        title: 'Заявление на отпуск',
        description: 'Стандартная форма заявления на ежегодный оплачиваемый отпуск',
        category: 'hr',
        externalUrl: 'https://docs.google.com/document/d/example-vacation',
        visibleTo: 'user',
      },
      {
        title: 'Заявка на командировку',
        description: 'Форма для оформления командировочных расходов',
        category: 'finance',
        externalUrl: 'https://docs.google.com/document/d/example-business-trip',
        visibleTo: 'user',
      },
      {
        title: 'Запрос на закупку',
        description: 'Согласование закупки оборудования и ПО',
        category: 'finance',
        externalUrl: 'https://docs.google.com/document/d/example-purchase',
        visibleTo: 'user',
      },
      {
        title: 'Макет рекламного креатива',
        description: 'Шаблон для согласования баннеров и макетов',
        category: 'marketing',
        externalUrl: 'https://www.figma.com/file/example-creative',
        visibleTo: 'marketer',
      },
      {
        title: 'Отчёт по маркетинговой кампании',
        description: 'Структура итогового отчёта по активности',
        category: 'marketing',
        externalUrl: 'https://docs.google.com/document/d/example-campaign-report',
        visibleTo: 'marketer',
      },
    ]);
    console.log('  ✓ seeded forms');
  }

  // ─── Knowledge base pages ────────────────────────────────────

  const existingKb = await db.select().from(schema.knowledgePages);
  if (existingKb.length === 0) {
    console.log('  → seeding knowledge pages');
    await db.insert(schema.knowledgePages).values([
      {
        slug: 'welcome',
        title: 'Добро пожаловать в TGD Intranet',
        summary: 'Что это за портал и зачем он нужен',
        category: 'general',
        body: `# Что такое TGD Intranet

Корпоративный хаб для быстрого доступа к сервисам компании.

## Что здесь есть

- **Главная** — объявления и быстрые ссылки
- **Сотрудники** — контакты коллег
- **Документы** — шаблоны заявлений и форм
- **База знаний** — внутренние гайды и регламенты
- **Маркетинг** — материалы для команды маркетинга
- **HR** — кадровая информация
- **Админ-панель** — управление (только для админов)

## Кому писать если что-то сломалось

Пишите в Telegram-бот мониторинга или администратору @admin_tgd.`,
        visibleTo: 'user',
        updatedBy: admin.id,
      },
      {
        slug: 'onboarding',
        title: 'Онбординг нового сотрудника',
        summary: 'Чек-лист первого рабочего дня',
        category: 'hr',
        body: `# Чек-лист первого дня

1. Получить корпоративный ноутбук
2. Настроить VPN (см. инструкцию в Notion)
3. Получить доступ к Bitrix24 и GitHub
4. Завести корпоративную почту
5. Пройти вводный тренинг по безопасности

## Полезные контакты

- IT-поддержка: @it_support
- HR: @elena_hr
- Безопасность: @sec_team`,
        visibleTo: 'user',
        updatedBy: admin.id,
      },
      {
        slug: 'brand-guidelines',
        title: 'Гайдлайны бренда',
        summary: 'Правила использования логотипа, цветов и типографики',
        category: 'marketing',
        body: `# Гайдлайны бренда

## Логотип

Основной логотип — горизонтальный синий. Используется во всех материалах.

## Цвета

- **Основной**: #0066CC (TGD Blue)
- **Акцент**: #FF6B35 (TGD Orange)
- **Фон**: #FFFFFF, #F5F5F5

## Типографика

- Заголовки: Involve Bold
- Текст: Involve Regular

## Что нельзя

- Растягивать логотип
- Менять цвета вне палитры
- Использовать логотип на пёстром фоне без подложки`,
        visibleTo: 'marketer',
        updatedBy: marketer.id,
      },
      {
        slug: 'security-policy',
        title: 'Политика информационной безопасности',
        summary: 'Базовые правила ИБ для всех сотрудников',
        category: 'security',
        body: `# Политика ИБ

## Пароли

- Минимум 12 символов
- Уникальный пароль для каждого сервиса
- Менеджер паролей обязателен (1Password / Bitwarden)
- 2FA на всех критичных аккаунтах

## Устройства

- Корпоративный ноутбук зашифрован
- USB-накопители только по согласованию с ИБ
- Личные устройства не подключаются к корп. сети без MDM

## Инциденты

Любая подозрительная активность → немедленно в @sec_team.`,
        visibleTo: 'user',
        updatedBy: admin.id,
      },
    ]);
    console.log('  ✓ seeded knowledge pages');
  }

  console.log('✅ Seed complete');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });

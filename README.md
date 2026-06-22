# tgdintranet

Корпоративный интранет-хаб TGD. Прототип: быстрый доступ к внутренним сервисам компании (маркетинговые данные, репозитории, контакты сотрудников, шаблоны заявлений, база знаний и т.д.).

## Стек

- **Backend**: Node.js 22, TypeScript, Express, Drizzle ORM, PostgreSQL 16, JWT (argon2 для паролей)
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui (Radix UI)
- **Инфра**: Docker, Docker Compose, Coolify (автодеплой из GitHub)

## Структура

```
tgdintranet/
├── packages/
│   ├── api/        # Node.js + Express backend
│   └── web/        # React frontend
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── docs/
```

## Роли

- **admin** — полный доступ, управление пользователями, контентом
- **marketer** — управление маркетинговыми разделами (материалы, кейсы, бренд)
- **user** — просмотр всех разделов (контакты, шаблоны, база знаний)

## Локальный запуск (dev)

```bash
docker compose -f docker-compose.dev.yml up
# API: http://localhost:3001
# Web: http://localhost:5173
```

## Production (Coolify)

Автодеплой из ветки `main`. См. `docs/DEPLOY.md`.

## Тестовые креды (только для прототипа)

| Роль | Email | Пароль |
|---|---|---|
| Админ | `admin@intranet.local` | `Admin2026!Demo` |
| Маркетолог | `marketer@intranet.local` | `Marketer2026!Demo` |
| Пользователь | `user@intranet.local` | `User2026!Demo` |

## Документация

- [ТЗ](docs/SPEC.md)
- [API](docs/API.md)
- [Деплой](docs/DEPLOY.md)
- [Ролевая модель](docs/RBAC.md)

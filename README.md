# tgdintranet

Корпоративный интранет-хаб TGD Apps. Миграция прототипа из Lovable+Supabase на собственный стек.

## Что сделано

- **UI скопирован 1-в-1** из `firstbeelancer/nexus-flow-team` (22 страницы, 49 UI-компонентов, шрифты Involve, логотипы, brandbook)
- **Supabase заменён на свой backend**: Express + PostgreSQL + Drizzle ORM + JWT
- **API совместим с Supabase-style**: `supabase.from('table').select()` теперь ходит в наш `/api/v1/...`
- **Auth**: JWT с 3 ролями (admin/marketer/user)
- **Deploy**: Docker Compose + Coolify с автодеплоем из `main`

## Что в репозитории

```
.
├── src/                 # React + Vite (исходный код UI)
├── packages/api/        # Backend (Express + Drizzle + PostgreSQL)
├── packages/web/        # этот README + дубликат web (для dev)
├── public/              # Шрифты, логотипы, статика
├── docker-compose.yaml  # Production (Coolify)
├── Dockerfile           # Web build
├── docs/                # Документация
└── .env.example
```

## Тестовые креды

| Роль | Email | Пароль |
|---|---|---|
| admin | `admin@intranet.local` | `Admin2026!Demo` |
| marketer | `marketer@intranet.local` | `Marketer2026!Demo` |
| user | `user@intranet.local` | `User2026!Demo` |

## Локальный запуск

```bash
docker compose -f docker-compose.dev.yaml up
# Web: http://localhost:8080
# API: http://localhost:3001
```

## Production

См. `docs/DEPLOY.md`.

## Что НЕ менялось

- Все компоненты в `src/components/`
- Все страницы в `src/pages/`
- Шрифты (Involve family) в `public/fonts/`
- Логотипы в `public/images/logos/`
- Дизайн-токены (цвета TGD Blue, Titan и т.д.)
- Маршрутизация

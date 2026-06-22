# RBAC — Ролевая модель

## Уровни ролей

```
admin     (уровень 3)  — полный доступ
marketer  (уровень 2)  — user + маркетинговые разделы + создание объявлений
user      (уровень 1)  — базовый просмотр
```

`requireRole(minRole)` пропускает, если `user.role.level >= minRole.level`.

## Контент с ограничением видимости

У каждой «видимой» сущности есть поле `visible_to` или `audience` (минимальная роль):

| Сущность | Поле | Кто может создавать |
|---|---|---|
| `announcements.audience` | минимальная роль | marketer, admin |
| `services.visible_to` | минимальная роль | marketer, admin |
| `forms.visible_to` | минимальная роль | только seed (пока) |
| `knowledge_pages.visible_to` | минимальная роль | только seed (пока) |

Фильтрация на бэке: `canViewContent(userRole, visibleTo) = userRole.level >= visibleTo.level`.

## Защита маршрутов

| Маршрут | Минимальная роль |
|---|---|
| `/login` | публичный |
| `/` (Главная) | user |
| `/employees` | user |
| `/forms` | user |
| `/knowledge`, `/knowledge/:slug` | user |
| `/marketing` | marketer |
| `/hr` | admin |
| `/admin` | admin |

`Protected` обёртка в `App.tsx` редиректит неавторизованных на `/login`, а пользователям без нужной роли показывает «Доступ запрещён».

## Тестовые креды (только для прототипа)

| Роль | Email | Пароль |
|---|---|---|
| **admin** | `admin@intranet.local` | `Admin2026!Demo` |
| **marketer** | `marketer@intranet.local` | `Marketer2026!Demo` |
| **user** | `user@intranet.local` | `User2026!Demo` |

Сменить пароли: `PUT /users/:id` (только admin) или прямой UPDATE в БД.

## Как протестировать ролевую модель

1. Войти как `user` → не видно «Маркетинг», «HR», «Админ-панель» в сайдбаре.
2. Войти как `marketer` → появляется «Маркетинг», создание объявлений, шаблоны для маркетинга.
3. Войти как `admin` → видно всё, включая управление пользователями в `/admin`.

Можно сравнить выдачу `/api/v1/services` под разными токенами: фильтр `visibleTo` отрезает лишнее на уровне API, даже если кто-то подделает UI.

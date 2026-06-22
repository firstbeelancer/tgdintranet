# API Reference

Базовый URL: `/api/v1` (за nginx проксируется на `api:3001`).

Все защищённые эндпоинты требуют заголовок:
```
Authorization: Bearer <jwt>
```

JWT выдаётся на 12 часов после `POST /auth/login`.

---

## Auth

### `POST /auth/login`

```json
// request
{ "email": "admin@intranet.local", "password": "Admin2026!Demo" }

// response 200
{
  "token": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "admin@intranet.local",
    "displayName": "Анна Администратор",
    "role": "admin",
    "position": "...",
    "department": "..."
  }
}
```

### `GET /auth/me`

Возвращает текущего пользователя по токену.

---

## Announcements

- `GET /announcements` — список, отфильтрованный по роли (видны объявления с `audience ≤ role`).
- `POST /announcements` — создать (`marketer` или `admin`).
- `DELETE /announcements/:id` — удалить (`admin`).

```json
{
  "title": "Плановые работы",
  "body": "С 23:00 до 01:00",
  "audience": "user",
  "isPinned": false
}
```

---

## Services (быстрые ссылки)

- `GET /services` — список, отфильтрованный по `visible_to ≤ role`.
- `POST /services` — создать (`marketer` или `admin`).
- `DELETE /services/:id` — удалить (`admin`).

---

## Employees

- `GET /employees` — все активные сотрудники.
- `GET /employees/:id/children` — дети сотрудника.

Доступ: любой авторизованный.

---

## Forms (шаблоны)

- `GET /forms` — список, отфильтрованный по `visible_to ≤ role`.

---

## Knowledge Base

- `GET /pages` — список страниц (summary), отфильтрованный по роли.
- `GET /pages/:slug` — полная страница (md body).

---

## Users (admin only)

- `GET /users` — все пользователи.
- `POST /users` — создать:

```json
{
  "email": "new@tigerapps.pro",
  "password": "StrongP@ss123",
  "displayName": "Иван Петров",
  "role": "user",
  "position": "Разработчик",
  "department": "Engineering"
}
```

- `PATCH /users/:id` — обновить поля (`displayName`, `role`, `position`, `department`, `isActive`).

---

## Health

- `GET /health` — `{ "status": "ok", ... }` (без авторизации).

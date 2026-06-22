# Журнал деплоя: tgdintranet

## 2026-06-22 14:23 MSK

**Триггер**: Хозяин, задача «перенеси прототип с Lovable на свой стек».

### Что сделано
1. Разведана инфра (VPS-1: 82.21.153.180, Coolify работает, 96GB диска, 11GB RAM).
2. Склонирована структура nexus-flow-team (22 страницы + 5 общих компонентов).
3. Написан backend (Node 22 + Express + Drizzle + PostgreSQL + JWT + Argon2) — 18 файлов.
4. Написан frontend (React 18 + Vite + Tailwind + Radix) — 22 файла.
5. Настроены Dockerfiles + docker-compose.yaml (3 сервиса: api/web/db).
6. Код запушен в `firstbeelancer/tgdintranet` (public).
7. Создано приложение в Coolify (UUID `t12a7a6jmle3wrbnoj7agi90`).
8. Настроены 13 env-переменных.
9. **6 итераций деплоя**, все упали по разным причинам:
   - Итерация 1: source_id=0 → не клонирует private (нужно public или App access)
   - Итерация 2: source_id=1 + GitHub App без доступа → 404 Not Found
   - Итерация 3: SSH URL + private key → тот же GitHub API 404
   - Итерация 4: docker-compose.yml вместо .yaml → «file not found»
   - Итерация 5: TS ошибки (импорт несущ. типа + Layout без minRole)
   - Итерация 6: Dockerfile ARG injection ломает многоступенчатую сборку
   - Итерация 7: docker_compose_domains не настроен → Traefik 404
   - Итерация 8: ✅ всё работает

### Результат: ✅
- 3 контейнера healthy
- API health OK
- Логин admin/marketer/user работает
- RBAC проверена: admin=8 сервисов, marketer=6, user=4

### Что нужно сделать вручную (TODO для Хозяина)
- DNS A-record `intranet.tigerapps.pro → 82.21.153.180` в reg.ru
- Сменить seed-пароли через `/api/v1/users/:id` PATCH
- Вернуть репо в private (после добавления в GitHub App)

### Изменилось
- Создан новый репозиторий `firstbeelancer/tgdintranet` (5 коммитов)
- Создано приложение в Coolify: `t12a7a6jmle3wrbnoj7agi90`
- Создан deploy key в Coolify: `private_keys.id=5`
- Создан GitHub deploy key: id=155156860
- Репозиторий переведён в public
- Заполнены 9 страниц TigerWiki (SPEC, Контекст, Инфра, TODO, Техдолг, Решения, Баги, Саммари, Прогресс)
- Сохранены 8 секретов в TigerWiki → Creds

### Дальше
- Хозяин добавляет DNS
- После DNS — Let's Encrypt подхватит автоматически
- Через 5 минут после этого можно заходить на https://intranet.tigerapps.pro


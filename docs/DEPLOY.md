# Deploy (Coolify)

## Архитектура деплоя

```
GitHub (firstbeelancer/tgdintranet, ветка main)
  ↓ webhook
Coolify (VPS-1: 82.21.153.180)
  ↓ build & run
3 контейнера на bridge network `tgdintranet`:
  - tgdintranet-db      (postgres:16-alpine)
  - tgdintranet-api     (Node.js + Express)
  - tgdintranet-web     (nginx:alpine + статика React)
Traefik
  ↓
intranet.tigerapps.pro → tgdintranet-web
api.intranet.tigerapps.pro → tgdintranet-api (опционально, web тоже проксирует /api)
```

## Один раз: создать приложение в Coolify

1. **Coolify → Add New Resource → Application → Docker Compose**
2. **Source**: GitHub App `firstbeelancer/tgdintranet`, ветка `main`, base directory `/`
3. **Build Pack**: Docker Compose (файл `docker-compose.yml`)
4. **Domains**: `intranet.tigerapps.pro`
5. **Env vars** (обязательные):
   - `DB_PASS` — сгенерировать `openssl rand -base64 32`
   - `JWT_SECRET` — `openssl rand -base64 48`
   - `ENCRYPTION_KEY` — `openssl rand -hex 32` (64 hex символа)
   - `DOMAIN=intranet.tigerapps.pro`
   - `CORS_ORIGIN=https://intranet.tigerapps.pro`
   - `SEED_ADMIN_PASSWORD=Admin2026!Demo`
   - `SEED_MARKETER_PASSWORD=Marketer2026!Demo`
   - `SEED_USER_PASSWORD=User2026!Demo`
6. **Persistent Storage**: только volume `tgdintranet_pgdata` для postgres (создаётся автоматически)
7. **Deploy** → дождаться `running:healthy`

## Автодеплой

Webhook настраивается автоматически при выборе GitHub App в Coolify.

Проверить: `Coolify → tgdintranet → Source → Webhook URL`. Любой `git push origin main` триггерит пересборку.

## Smoke-test после деплоя

```bash
# API health
curl -s https://intranet.tigerapps.pro/api/v1/health
# ожидаем: {"status":"ok",...}

# Login
curl -s -X POST https://intranet.tigerapps.pro/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intranet.local","password":"Admin2026!Demo"}'
# ожидаем: {"token":"...","user":{...,"role":"admin"}}

# Web
curl -sI https://intranet.tigerapps.pro/
# ожидаем: HTTP 200
```

## DNS

A-запись в reg.ru: `intranet.tigerapps.pro → 82.21.153.180`

SSL (Let's Encrypt) подхватится автоматически через Traefik.

## Логи

```bash
ssh root@82.21.153.180
docker logs -f --tail 100 tgdintranet-api
docker logs -f --tail 100 tgdintranet-web
docker logs -f --tail 100 tgdintranet-db
```

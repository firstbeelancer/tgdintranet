FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY tsconfig.json ./
COPY package.json ./

ARG CACHEBUST=1
RUN echo "Cache bust: $CACHEBUST" && date

RUN npm install --no-save tsx@4.19.0

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/v1/health || exit 1

# Auto-migrate on start, then run server
CMD ["sh", "-c", "npx tsx src/db/migrate.ts && npx tsx src/db/seed.ts && npx tsx src/index.ts"]

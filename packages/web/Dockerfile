FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=/api
ARG COOLIFY_URL
ARG COOLIFY_FQDN
ARG COOLIFY_BRANCH
ARG COOLIFY_RESOURCE_UUID
ARG COOLIFY_CONTAINER_NAME
ARG SERVICE_FQDN_WEB
ARG SERVICE_URL_WEB
ENV VITE_API_URL=${VITE_API_URL}

COPY packages/web/package.json ./
RUN npm install

COPY packages/web ./
RUN npm run build

FROM nginx:alpine
ARG COOLIFY_URL
ARG COOLIFY_FQDN
ARG COOLIFY_BRANCH
ARG COOLIFY_RESOURCE_UUID
ARG COOLIFY_CONTAINER_NAME
ARG SERVICE_FQDN_WEB
ARG SERVICE_URL_WEB

COPY --from=builder /app/dist /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

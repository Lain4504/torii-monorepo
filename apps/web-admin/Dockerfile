# Build and serve web-admin (Vite) as static via nginx
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.4.1

FROM base AS builder
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web-admin build

FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/apps/web-admin/dist ./dist
COPY docker/nginx-web-admin.conf /etc/nginx/conf.d/default.conf
EXPOSE 4173
CMD ["nginx", "-g", "daemon off;"]


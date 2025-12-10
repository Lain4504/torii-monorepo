# Course microservice (Nest TCP) image
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.4.1

FROM base AS builder
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter server build
RUN pnpm prune --prod

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@10.4.1
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY --from=builder /app/apps/server/tsconfig.build.json ./apps/server/tsconfig.build.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 8082
CMD ["node", "apps/server/dist/apps/course-service/main.js"]


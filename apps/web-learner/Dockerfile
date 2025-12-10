# Build and run Next.js (web-learner) in standalone mode
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.4.1

FROM base AS builder
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web-learner build
RUN pnpm --filter web-learner prune --prod

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
RUN npm install -g pnpm@10.4.1

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/web-learner/package.json ./apps/web-learner/package.json
COPY packages ./packages
COPY --from=builder /app/apps/web-learner/.next/standalone ./apps/web-learner
COPY --from=builder /app/apps/web-learner/.next/static ./apps/web-learner/.next/static
COPY --from=builder /app/apps/web-learner/public ./apps/web-learner/public

EXPOSE 3002
CMD ["node", "apps/web-learner/server.js"]


FROM node:20-slim AS builder

WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/voice-agent/package.json ./apps/voice-agent/

# Install dependencies (only for voice-agent)
# Note: Since it's a monorepo, some dependencies might be at the root
RUN pnpm install --filter voice-agent...

# Copy source code
COPY apps/voice-agent ./apps/voice-agent

# Build TypeScript
WORKDIR /app/apps/voice-agent
RUN pnpm run build

# --- Runner Stage ---
FROM node:20-slim AS runner

WORKDIR /app/apps/voice-agent

# Copy built artifacts and node_modules
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/voice-agent/dist ./dist
COPY --from=builder /app/apps/voice-agent/package.json ./
COPY --from=builder /app/apps/voice-agent/node_modules ./node_modules

# Expose port (default 8082 as seen in server.ts)
EXPOSE 8082

# Default environment variables
ENV NODE_ENV=production
ENV PORT=8082

CMD ["npm", "start"]

FROM node:20-slim AS builder

WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Build Dependencies
RUN apt-get update -y && apt-get install -y openssl

# Copy package files from mcp-server
COPY mcp-server/package.json ./
# If there are workspace dependencies, we might need more things here
# But mcp-server seems standalone in its dependencies

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code from mcp-server
COPY mcp-server/src ./src
COPY mcp-server/tsconfig.json ./tsconfig.json

# Copy the actual assets directory from parent (agents/src/assets)
COPY src/assets ./assets

# Build
RUN pnpm run build

# --- Runner Stage ---
FROM node:20-slim AS runner

WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Assets directory - now available from build context
COPY --from=builder /app/assets ./assets

EXPOSE 3333

CMD ["npm", "run", "start:prod"]

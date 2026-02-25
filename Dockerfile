# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

# Install all dependencies (with BuildKit cache for pnpm store)
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build and prune dev dependencies
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build && pnpm prune --prod

# Final image: only prod deps + built output
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "./dist/server/entry.mjs"]

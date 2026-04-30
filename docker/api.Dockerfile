# ──────────────────────────────────────────────
# Stage 1: Prune monorepo for API
# ──────────────────────────────────────────────
FROM node:20.12.0-alpine3.19 AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

# ──────────────────────────────────────────────
# Stage 2: Base dependencies (Shared)
# ──────────────────────────────────────────────
FROM node:20.12.0-alpine3.19 AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./
RUN npm ci

# Stage 3: Development Stage (Full Dependencies)
FROM base AS development
WORKDIR /app
COPY --from=pruner /app/out/full/ ./
# Generate Prisma client for dev
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
# Build shared for the dev environment
RUN npm run build --workspace=@postrestoran/shared

# Stage 4: Build for Production
FROM development AS builder
WORKDIR /app
# Build API
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=api

# Stage 5: Prune for production
FROM base AS installer
WORKDIR /app
# Copy shared artifacts and prisma schema
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
# FIX 2: Reuse the generated client from builder to avoid double generation
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
# Prune node_modules to production only
RUN npm prune --omit=dev

# ──────────────────────────────────────────────
# Stage 5: Production runner
# ──────────────────────────────────────────────
FROM node:20.12.0-alpine3.19 AS runner
# FIX 1: Add wget for healthcheck
RUN apk add --no-cache libc6-compat openssl wget
WORKDIR /app

# FIX 5: Enterprise memory guard
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app

USER nestjs

# Production artifacts
# FIX 3: Deterministic path handling (COPYing specifically into root for clarity if possible)
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# FIX 4: Clean node_modules resolution
COPY --from=installer /app/node_modules ./node_modules

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3001/api/v1/health || exit 1

# Start the app
# FIX 3: Deterministic entrypoint
CMD ["node", "dist/main"]

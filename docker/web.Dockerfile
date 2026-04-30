# ──────────────────────────────────────────────
# Stage 1: Prune monorepo for WEB
# ──────────────────────────────────────────────
FROM node:20.12.0-alpine3.19 AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# ──────────────────────────────────────────────
# Stage 2: Install dependencies
# ──────────────────────────────────────────────
FROM node:20.12.0-alpine3.19 AS installer
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# First install dependencies
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./
RUN npm ci

# Stage 3: Development Stage (Full Dependencies)
FROM installer AS development
WORKDIR /app
COPY --from=pruner /app/out/full/ ./
# Build shared for dev
RUN npm run build --workspace=@postrestoran/shared

# Stage 4: Build the Web App
FROM development AS builder
WORKDIR /app

# Copy environment variables for build time
# (NEXT_PUBLIC_ variables are bundled into the client)
COPY .env.docker .env
COPY .env.docker apps/web/.env

# Build the project
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OTEL_VERBOSE=1

RUN npm run build --workspace=@postrestoran/shared
RUN npm run build --workspace=web

# ──────────────────────────────────────────────
# Stage 4: Production runner
# ──────────────────────────────────────────────
FROM node:20.12.0-alpine3.19 AS runner
# FIX 1: Add wget for healthcheck
RUN apk add --no-cache libc6-compat openssl wget
WORKDIR /app

ENV NODE_ENV=production
# FIX 5: Enterprise memory guard
ENV NODE_OPTIONS="--max-old-space-size=512"

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "apps/web/server.js"]

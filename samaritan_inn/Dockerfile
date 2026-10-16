# Next.js standalone build for NPTS infra (ECS on arm64, port 3000).
# DATABASE_URL and other secrets come from the runtime env file in S3; the SQLite
# DB lives on EFS (file:/efs/prod.db). Migrations run in the NPTS migration Lambda,
# so the runner image carries no Prisma CLI.

# --- Stage 1: dependencies ---
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --ignore-scripts skips @prisma/client's postinstall generate; the builder runs it.
RUN corepack pnpm install --frozen-lockfile --ignore-scripts

# --- Stage 2: build ---
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must be passed as build args; the runtime env file cannot reach them.
ARG NEXT_PUBLIC_SF_OWNER_1
ARG NEXT_PUBLIC_SF_OWNER_2
ARG NEXT_PUBLIC_SF_OWNER_3
ENV NEXT_PUBLIC_SF_OWNER_1=$NEXT_PUBLIC_SF_OWNER_1 \
    NEXT_PUBLIC_SF_OWNER_2=$NEXT_PUBLIC_SF_OWNER_2 \
    NEXT_PUBLIC_SF_OWNER_3=$NEXT_PUBLIC_SF_OWNER_3
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN corepack pnpm exec prisma generate \
    && corepack pnpm run build

# --- Stage 3: runner ---
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# =====================================================================
# Satu Dockerfile untuk semua environment. Nilai di bawah BUKAN secret.
#   Prod    : docker build -t juarapay-dashboard .
#   Sandbox : docker build -t juarapay-dashboard:sandbox \
#               --build-arg SIMULATOR=sandbox \
#               --build-arg API_BASE_URL=http://jdp-main-sandbox:8080 \
#               --build-arg APP_ORIGIN=https://sandbox.juarapay.id .
# NEXT_PUBLIC_* dibake saat build; API_BASE_URL/APP_ORIGIN dapat di-override saat run (-e).
# =====================================================================
FROM node:22.23.4-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
ARG SIMULATOR=normal
ARG API_BASE_URL=http://jdp-main-prod:8080
ARG APP_ORIGIN=https://app.juarapay.id
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SIMULATOR=$SIMULATOR
ENV NEXT_PUBLIC_SIMULATOR=$SIMULATOR
ENV API_BASE_URL=$API_BASE_URL
ENV APP_ORIGIN=$APP_ORIGIN
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22.23.4-alpine AS runner
WORKDIR /app
ARG SIMULATOR=normal
ARG API_BASE_URL=http://jdp-main-prod:8080
ARG APP_ORIGIN=https://app.juarapay.id
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SIMULATOR=$SIMULATOR
ENV NEXT_PUBLIC_SIMULATOR=$SIMULATOR
ENV API_BASE_URL=$API_BASE_URL
ENV APP_ORIGIN=$APP_ORIGIN

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

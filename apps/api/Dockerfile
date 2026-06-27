FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat openssl

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune api --docker

FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

COPY --from=builder /app/out/full/ .
# This will run prisma generate and nest build for the api app
# We provide a dummy database URL because prisma generate strictly requires it to be set, even though it doesn't connect.
ENV DATABASE_POSTGRES_PRISMA_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm turbo run build --filter=api...

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# We need the root node_modules for hoisted dependencies
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/packages ./packages
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api
EXPOSE 3001

CMD ["node", "dist/src/main"]

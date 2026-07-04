# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json         ./lib/api-spec/
COPY lib/api-zod/package.json          ./lib/api-zod/
COPY lib/db/package.json               ./lib/db/
COPY scripts/package.json              ./scripts/
COPY artifacts/api-server/package.json    ./artifacts/api-server/
COPY artifacts/torre-obscura/package.json ./artifacts/torre-obscura/

RUN pnpm install

COPY . .

RUN pnpm --filter @workspace/torre-obscura run build
RUN pnpm --filter @workspace/api-server run build

# ─── Stage 2: Produção ────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json      ./lib/db/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Instalamos as dependências necessárias
RUN pnpm install

COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/torre-obscura/dist/public ./artifacts/torre-obscura/dist/public
COPY --from=builder /app/lib/db ./lib/db

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Chamamos o arquivo executável do drizzle diretamente via Node, apontando para o arquivo config copiado
CMD ["sh", "-c", "pnpm --filter @workspace/db run push && node --enable-source-maps artifacts/api-server/dist/index.mjs"]

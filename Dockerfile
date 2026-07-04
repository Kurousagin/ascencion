# ─── Stage 1: Build ───────────────────────────────────────────────────────────
# Instala dependências e compila frontend (Vite) + API server (esbuild bundle).
FROM node:22-alpine AS builder

# pnpm 9 — alinhado com lockfileVersion: 9.0
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copia manifestos de workspace primeiro (maximiza cache de layers)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copia todos os package.json dos pacotes do monorepo
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json          ./lib/api-spec/
COPY lib/api-zod/package.json           ./lib/api-zod/
COPY lib/db/package.json                ./lib/db/
COPY scripts/package.json               ./scripts/
COPY artifacts/api-server/package.json    ./artifacts/api-server/
COPY artifacts/torre-obscura/package.json ./artifacts/torre-obscura/
# mockup-sandbox é dev-only e está no .dockerignore — não incluído aqui

# Instala todas as dependências (dev incluído — necessário para builds)
RUN pnpm install

# Copia o código-fonte
COPY . .

# Build do frontend (Vite → artifacts/torre-obscura/dist/public)
RUN pnpm --filter @workspace/torre-obscura run build

# Build do API server (esbuild bundle → artifacts/api-server/dist/)
RUN pnpm --filter @workspace/api-server run build

# ─── Stage 2: Produção ────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# 1. Copia o necessário para instalar as dependências de produção
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY lib/db/package.json ./lib/db/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# 2. Prepara o pnpm e instala apenas dependências de produção
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN pnpm install --prod

# 3. Copia os artefatos compilados do stage anterior
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/torre-obscura/dist/public ./artifacts/torre-obscura/dist/public
# Copia a pasta do banco para que o comando 'push' funcione
COPY --from=builder /app/lib/db ./lib/db

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# 4. Comando único que faz a migração E inicia o servidor
CMD ["sh", "-c", "pnpm --filter db push && node --enable-source-maps artifacts/api-server/dist/index.mjs"]

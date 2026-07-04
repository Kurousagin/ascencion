# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copia manifestos e estrutura de workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copia package.json de todos os pacotes para garantir que o pnpm reconheça o grafo
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json         ./lib/api-spec/
COPY lib/api-zod/package.json          ./lib/api-zod/
COPY lib/db/package.json               ./lib/db/
COPY scripts/package.json              ./scripts/
COPY artifacts/api-server/package.json    ./artifacts/api-server/
COPY artifacts/torre-obscura/package.json ./artifacts/torre-obscura/

RUN pnpm install

# Copia o código-fonte restante
COPY . .

# Build
RUN pnpm --filter @workspace/torre-obscura run build
RUN pnpm --filter @workspace/api-server run build

# ─── Stage 2: Produção ────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Instala ferramentas necessárias para rodar o pnpm em produção
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copia arquivos necessários para o pnpm resolver o workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json      ./lib/db/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Instala apenas dependências de produção
RUN pnpm install --prod

# Copia artefatos compilados e a lógica do banco (necessária para o 'push')
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/torre-obscura/dist/public ./artifacts/torre-obscura/dist/public
COPY --from=builder /app/lib/db ./lib/db

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Migra o banco (push) e inicia a aplicação
CMD ["sh", "-c", "npx drizzle-kit push --config ./lib/db/drizzle.config.ts && node --enable-source-maps artifacts/api-server/dist/index.mjs"]

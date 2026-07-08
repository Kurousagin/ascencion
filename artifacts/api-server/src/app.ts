import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";
import { runNotificationTick } from "./lib/push-tick";

// Comparação em tempo constante do segredo do cron (evita timing attack) e
// normaliza header duplicado (array).
function cronSecretValido(fornecido: unknown, esperado: string): boolean {
  const valor = Array.isArray(fornecido) ? fornecido[0] : fornecido;
  if (typeof valor !== "string") return false;
  const a = Buffer.from(valor);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const app: Express = express();

// Desabilita ETags globalmente. O proxy do Replit em produção cacheava
// respostas GET usando ETags — ex: /aliadas retornava [] do cache mesmo
// após aliança ser formada no banco.
app.set("etag", false);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Internal cron endpoint (protected) ────────────────────────────────────────
app.post("/internal/notificacoes/executar-ciclo", async (req, res): Promise<void> => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !cronSecretValido(req.headers["x-cron-secret"], cronSecret)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await runNotificationTick();
    res.json(result);
  } catch (error) {
    logger.error(error, "Error running notification tick");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── API routes ───────────────────────────────────────────────────────────────
// Cache-Control: no-store apenas nas rotas de API (dados mutáveis).
// Arquivos estáticos têm seus próprios headers de cache (hash no nome).
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
}, router);

// ─── Frontend estático (produção / deploy externo) ────────────────────────────
// Em dev o Vite serve o frontend; em produção o Express serve os arquivos
// buildados. O fallback para index.html suporta client-side routing (SPA).
if (process.env["NODE_ENV"] === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // Em produção o CWD é /app (raiz do repo dentro do container Docker)
  const staticDir = path.resolve(process.cwd(), "artifacts/torre-obscura/dist/public");

  app.use(express.static(staticDir, {
    // Arquivos com hash no nome (Vite) podem ser cacheados por 1 ano
    setHeaders(res, filePath) {
      if (/\.[0-9a-f]{8,}\.(js|css|woff2?)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));

  // SPA fallback: rotas não-/api servem o index.html (client-side routing).
  // O padrão exclui /api/* explicitamente para que rotas de API inexistentes
  // retornem 404 JSON em vez de HTML.
  app.get(/^(?!\/api(?:\/|$))/, (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;

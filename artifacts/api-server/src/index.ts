import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { migrate } from "drizzle-orm/pg-core/migration";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runMigrations() {
  try {
    const migrationsDir = join(process.cwd(), "lib/db/drizzle");

    // Check if push_subscriptions table exists
    const tableExists = await db
      .execute(
        `SELECT to_regclass('public.push_subscriptions')` as any
      )
      .then(() => true)
      .catch(() => false);

    if (tableExists) {
      logger.info("push_subscriptions table already exists, skipping migrations");
      return;
    }

    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith(".sql")).sort();

    for (const file of sqlFiles) {
      const sql = await readFile(join(migrationsDir, file), "utf-8");
      // Split by statement-breakpoint to execute individually
      const statements = sql.split(/^--> statement-breakpoint\n/m).filter(s => s.trim());

      for (const stmt of statements) {
        try {
          await db.execute(stmt as any);
        } catch (e) {
          const err = e as { message?: string };
          if (err.message?.includes("already exists")) {
            logger.debug({ migration: file }, "Statement already applied");
          } else {
            logger.warn({ error: err.message, stmt: stmt.substring(0, 100) }, "Statement error");
          }
        }
      }
      logger.info({ migration: file }, "Migration processed");
    }
  } catch (error) {
    logger.warn(error, "Migration check failed, continuing anyway");
  }
}

(async () => {
  await runMigrations();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
})();

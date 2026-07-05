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
    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith(".sql")).sort();

    for (const file of sqlFiles) {
      const sql = await readFile(join(migrationsDir, file), "utf-8");
      try {
        await db.execute(sql as any);
        logger.info({ migration: file }, "Migration applied");
      } catch (e) {
        const err = e as { message?: string };
        if (err.message?.includes("already exists")) {
          logger.info({ migration: file }, "Migration already applied");
        } else {
          throw e;
        }
      }
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

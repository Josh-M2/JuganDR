import { config as loadEnv } from "dotenv";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(root, "../../.env.local") });
loadEnv({ path: join(root, "../.env") });
if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL_UNPOOLED before running migrations.");

const connectionString = (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL)
  .replace("sslmode=require", "sslmode=verify-full");
const client = new pg.Client({ connectionString });
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
  const name = "001_initial";
  const applied = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [name]);
  if (!applied.rowCount) {
    const sql = await readFile(join(root, "../../docs/schema.sql"), "utf8");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
    console.log(`Applied ${name}`);
  } else {
    console.log(`${name} already applied`);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}

import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./src/app.js";
import { JsonStore } from "./src/store.js";
import { PgStore } from "./src/pg-store.js";
import { NeonObjectStorage } from "./src/uploads.js";
import { makeRealtime } from "./src/realtime.js";

const root = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(root, "../.env.local") });
loadEnv({ path: join(root, ".env") });

const dataDir = process.env.DATA_DIR || join(root, "data");
const settings = {
  clientUrl: process.env.CLIENT_URL || "http://localhost:3102",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  sessionSecret: process.env.SESSION_SECRET || "",
  production: process.env.NODE_ENV === "production",
  uploadDir: join(dataDir, "uploads"),
  storageMode: process.env.DATABASE_URL ? "neon-postgres" : "local-json",
  storage: process.env.DATABASE_URL
    ? new NeonObjectStorage(process.env.ATTACHMENTS_BUCKET || "jugan-request-attachments")
    : null,
  realtime: process.env.DATABASE_URL && process.env.NEON_REALTIME_SECRET
    ? makeRealtime(process.env.DATABASE_URL, process.env.NEON_REALTIME_SECRET)
    : null,
  realtimeUrl: process.env.NEON_REALTIME_URL || "",
  chromePath:
    process.env.CHROME_PATH ||
    (process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/chromium"),
};
const port = Number(process.env.PORT) || 3101;
const host = process.env.HOST || "127.0.0.1";
const store = process.env.DATABASE_URL
  ? new PgStore(process.env.DATABASE_URL)
  : new JsonStore(join(dataDir, "store.json"));
await store.init();
const app = createApp(store, settings);
app.listen(port, host, () => {
  console.log(`Jugan API listening at http://${host}:${port}`);
  console.log(`Data backend: ${settings.storageMode}`);
  if (!settings.adminEmail || !settings.adminPassword || !settings.sessionSecret) {
    console.warn("Admin login is not configured. Run pnpm run setup:admin.");
  }
});

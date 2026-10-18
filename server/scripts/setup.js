import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const file = join(process.cwd(), ".env");
try {
  await readFile(file);
  console.error("server/.env already exists. Edit it directly if you need to change credentials.");
  process.exitCode = 1;
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  const password = randomBytes(18).toString("base64url");
  const secret = randomBytes(32).toString("hex");
  await writeFile(
    file,
    `PORT=3101\nHOST=127.0.0.1\nCLIENT_URL=http://localhost:3102\nADMIN_EMAIL=admin@jugan.local\nADMIN_PASSWORD=${password}\nSESSION_SECRET=${secret}\n`,
    { flag: "wx", mode: 0o600 }
  );
  console.log("Created server/.env with local admin credentials.");
  console.log("Email: admin@jugan.local");
  console.log(
    "The generated password and session secret are in server/.env. Keep that file private."
  );
}

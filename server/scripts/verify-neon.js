import assert from "node:assert/strict";
import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRealtimeClient } from "@neon/realtime/client";
import { createApp } from "../src/app.js";
import { PgStore } from "../src/pg-store.js";
import { NeonObjectStorage } from "../src/uploads.js";
import { makeRealtime } from "../src/realtime.js";

const root = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(root, "../../.env.local") });
loadEnv({ path: join(root, "../.env") });
for (const key of [
  "DATABASE_URL", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY",
  "NEON_REALTIME_URL", "NEON_REALTIME_SECRET", "ADMIN_EMAIL",
  "ADMIN_PASSWORD", "SESSION_SECRET",
]) {
  if (!process.env[key]) throw new Error(`${key} is missing.`);
}

const store = new PgStore(process.env.DATABASE_URL);
const storage = new NeonObjectStorage(process.env.ATTACHMENTS_BUCKET || "jugan-request-attachments");
const realtime = makeRealtime(process.env.DATABASE_URL, process.env.NEON_REALTIME_SECRET);
const app = createApp(store, {
  clientUrl: "http://localhost:3102",
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  sessionSecret: process.env.SESSION_SECRET,
  production: false,
  storage,
  storageMode: "neon-postgres",
  realtime,
  realtimeUrl: process.env.NEON_REALTIME_URL,
  chromePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
let server;
let realtimeClient;
let requestId;
let applicantId;
let objectKeys = [];
let trackingCode;

function awaitStatus(subscription, expected, id, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let stop = () => {};
    const timer = setTimeout(() => {
      stop();
      reject(new Error(`Realtime did not show ${expected} within ${timeoutMs} ms.`));
    }, timeoutMs);
    const check = (snapshot) => {
      if (snapshot.status === "error") {
        stop();
        reject(snapshot.error);
      } else if (snapshot.status === "live" && snapshot.data?.find((row) => row.id === id)?.status === expected) {
        stop();
        resolve();
      }
    };
    stop = subscription.onChange(check);
    check(subscription.getSnapshot());
  });
}

try {
  await store.init();
  server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const form = new FormData();
  for (const [key, value] of Object.entries({
    documentTypeId: "indigency", firstName: "Portfolio", middleName: "",
    lastName: "Verification", suffix: "", age: "30", mobileNumber: "0900000000",
    street: "Demo Street", barangay: "Jugan", city: "Consolacion",
    province: "Cebu", purpose: "Neon integration check",
  })) form.append(key, value);
  const image = new Blob([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])], {
    type: "image/png",
  });
  for (const kind of ["frontId", "backId", "residencyProof"])
    form.append(kind, image, `${kind}.png`);

  const submittedResponse = await fetch(`${base}/requests`, { method: "POST", body: form });
  const submitted = await submittedResponse.json();
  assert.equal(submittedResponse.status, 201, JSON.stringify(submitted));
  assert.match(submitted.trackingCode, /^JG-[A-F0-9]{10}$/);
  trackingCode = submitted.trackingCode;
  console.log("PASS: API submission committed to Postgres and uploaded three objects");

  const tracking = await fetch(`${base}/track/${submitted.trackingCode}`).then((response) => response.json());
  assert.equal(tracking.status, "submitted");
  assert.equal(JSON.stringify(tracking).includes("0900000000"), false);
  console.log("PASS: public tracking reads status without private applicant data");

  const login = await fetch(`${base}/admin/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  });
  assert.equal(login.status, 200);
  const headers = { Cookie: login.headers.get("set-cookie").split(";")[0] };
  const requests = await fetch(`${base}/admin/requests`, { headers }).then((response) => response.json());
  const request = requests.find((item) => item.trackingCode === submitted.trackingCode);
  assert.equal(request.attachments.length, 3);
  requestId = request.id;
  applicantId = request.applicant.id;
  const keys = await store.pool.query("SELECT storage_key FROM attachments WHERE request_id=$1", [requestId]);
  objectKeys = keys.rows.map((item) => item.storage_key);
  const attachment = await fetch(`${base}/admin/requests/${requestId}/attachments/${request.attachments[0].id}`, { headers });
  assert.equal(attachment.status, 200);
  assert.equal(attachment.headers.get("content-type"), "image/png");
  assert.equal(Buffer.from(await attachment.arrayBuffer()).toString("hex").startsWith("89504e47"), true);
  console.log("PASS: staff dashboard and private object download");

  const sealedResponse = await fetch(`${base}/live/track/${submitted.trackingCode}`);
  assert.equal(sealedResponse.status, 200);
  const { sealedQuery, url } = await sealedResponse.json();
  const blocked = await fetch(`${base}/admin/live/requests`);
  assert.equal(blocked.status, 401);
  const staffLive = await fetch(`${base}/admin/live/requests`, { headers });
  assert.equal(staffLive.status, 200);
  const staffCapability = await staffLive.json();
  assert.ok(staffCapability.sealedQuery.capability);
  realtimeClient = createRealtimeClient({ url });
  const subscription = realtimeClient.subscribe(sealedQuery);
  const staffSubscription = realtimeClient.subscribe(staffCapability.sealedQuery);
  await Promise.all([
    awaitStatus(subscription, "submitted", requestId),
    awaitStatus(staffSubscription, "submitted", requestId),
  ]);
  const statusResponse = await fetch(`${base}/admin/requests/${requestId}/status`, {
    method: "POST", headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "reviewing" }),
  });
  assert.equal(statusResponse.status, 200);
  await Promise.all([
    awaitStatus(subscription, "reviewing", requestId),
    awaitStatus(staffSubscription, "reviewing", requestId),
  ]);
  subscription.unsubscribe();
  staffSubscription.unsubscribe();
  console.log("PASS: Neon Realtime pushed the status change to tracker and dashboard without polling");
} finally {
  realtimeClient?.close();
  if (!requestId && trackingCode) {
    const lookup = await store.pool.query(
      "SELECT id, applicant_id FROM requests WHERE tracking_code=$1", [trackingCode]
    );
    requestId = lookup.rows[0]?.id;
    applicantId = lookup.rows[0]?.applicant_id;
  }
  if (requestId) {
    if (!objectKeys.length) {
      const keys = await store.pool.query("SELECT storage_key FROM attachments WHERE request_id=$1", [requestId]);
      objectKeys = keys.rows.map((item) => item.storage_key);
    }
    await store.pool.query("DELETE FROM requests WHERE id=$1", [requestId]);
    if (applicantId) await store.pool.query("DELETE FROM applicants WHERE id=$1", [applicantId]);
  }
  if (objectKeys.length) await storage.remove(objectKeys.map((storedName) => ({ storedName })));
  storage.s3.destroy();
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  await store.close();
  console.log("PASS: synthetic database rows and objects cleaned up");
}
// The Realtime SDK can retain a reconnect timer after close in a standalone Node check.
process.exit(0);

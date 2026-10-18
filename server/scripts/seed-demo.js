import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { staffConfirmations } from "../src/domain.js";
import { PgStore } from "../src/pg-store.js";
import { NeonObjectStorage } from "../src/uploads.js";

const root = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(root, "../../.env.local") });
loadEnv({ path: join(root, "../.env") });
for (const key of ["DATABASE_URL", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "ADMIN_EMAIL"]) {
  if (!process.env[key]) throw new Error(`${key} is required to seed the Neon demo.`);
}

// Every person and attachment in this seed is fictional. The purpose marker makes
// the command safe to rerun without duplicating its sample requests.
const samples = [
  ["Maria", "Santos", 29, "barangay-clearance", "submitted", 2, "Employment application"],
  ["Paolo", "Reyes", 34, "residency", "reviewing", 5, "Proof of residence"],
  ["Angela", "Cruz", 22, "indigency", "ready", 8, "Scholarship application"],
  ["Daniel", "Lim", 41, "business-permit", "approved", 12, "Small business registration"],
  ["Isabel", "Garcia", 27, "barangay-certificate", "submitted", 16, "Local certification"],
  ["Carlo", "Mendoza", 36, "no-claims-conflict", "reviewing", 23, "Property documentation"],
  ["Elena", "Navarro", 68, "senior-citizen", "released", 30, "Senior citizen requirements"],
  ["Rafael", "Torres", 31, "barangay-clearance", "ready", 38, "Employment application"],
  ["Bea", "Villanueva", 25, "residency", "submitted", 46, "School enrollment"],
  ["Miguel", "Aquino", 39, "indigency", "rejected", 60, "Assistance application"],
  ["Rosa", "Fernandez", 72, "senior-citizen", "approved", 72, "Senior citizen requirements"],
  ["Nico", "Ramos", 44, "business-permit", "released", 90, "Local business renewal"],
];

const steps = {
  submitted: [],
  reviewing: ["reviewing"],
  approved: ["reviewing", "approved"],
  ready: ["reviewing", "approved", "ready"],
  released: ["reviewing", "approved", "ready", "released"],
  rejected: ["rejected"],
};
const notes = {
  reviewing: "Requirements are being reviewed.",
  approved: "Details checked; document preparation can proceed.",
  ready: "Document is ready for pickup.",
  released: "Document was released.",
  rejected: "Please submit clearer supporting documents.",
};
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Kk0AAAAASUVORK5CYII=",
  "base64"
);
const placeholder = { buffer: png, originalname: "DEMO-placeholder-not-a-real-ID.png", size: png.length };
const files = {
  frontId: [placeholder],
  backId: [placeholder],
  residencyProof: [placeholder],
};

const store = new PgStore(process.env.DATABASE_URL);
const storage = new NeonObjectStorage(process.env.ATTACHMENTS_BUCKET || "jugan-request-attachments");
let created = 0;
let existing = 0;
try {
  await store.init();
  for (const [firstName, lastName, age, documentTypeId, targetStatus, hoursAgo, reason] of samples) {
    const purpose = `Portfolio demo: ${reason}`;
    const found = await store.pool.query(
      `SELECT r.id FROM requests r JOIN applicants a ON a.id=r.applicant_id
       WHERE r.purpose=$1 AND a.first_name=$2 AND a.last_name=$3 LIMIT 1`,
      [purpose, firstName, lastName]
    );
    if (found.rowCount) {
      existing++;
      continue;
    }

    const uploaded = await storage.save(files);
    let request;
    try {
      request = await store.createRequest({
        documentTypeId, firstName, middleName: "", lastName, suffix: "",
        age, mobileNumber: "09000000000", street: "Purok Demo 1",
        barangay: "Jugan", city: "Consolacion", province: "Cebu", purpose,
      }, uploaded);
      for (const status of steps[targetStatus]) {
        await store.updateStatus(
          request.id, status, notes[status], staffConfirmations[status] || "",
          process.env.ADMIN_EMAIL
        );
      }
      const receivedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      const events = await store.pool.query(
        "SELECT id FROM request_status_events WHERE request_id=$1 ORDER BY created_at, id",
        [request.id]
      );
      const spacing = Math.min(60 * 60 * 1000, (Date.now() - receivedAt.getTime()) / (events.rowCount + 1));
      for (const [index, event] of events.rows.entries()) {
        await store.pool.query("UPDATE request_status_events SET created_at=$2 WHERE id=$1", [
          event.id, new Date(receivedAt.getTime() + index * spacing),
        ]);
      }
      const updatedAt = new Date(receivedAt.getTime() + (events.rowCount - 1) * spacing);
      await store.pool.query(`
        UPDATE requests SET requested_at=$2, updated_at=$3,
          released_at=CASE WHEN status='released' THEN $3::timestamptz ELSE NULL END
        WHERE id=$1`, [request.id, receivedAt, updatedAt]);
      created++;
    } catch (error) {
      if (request) {
        await store.pool.query("DELETE FROM requests WHERE id=$1", [request.id]);
        await store.pool.query("DELETE FROM applicants WHERE id=$1", [request.applicant.id]);
      }
      await storage.remove(uploaded);
      throw error;
    }
  }
  console.log(`Portfolio demo data: ${created} requests created, ${existing} already present.`);
} finally {
  storage.s3.destroy();
  await store.close();
}

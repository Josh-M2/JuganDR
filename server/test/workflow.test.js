import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../src/app.js";
import { JsonStore } from "../src/store.js";

test("public submission, private admin review, tracking, and PDF", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "jugan-test-"));
  const store = new JsonStore(join(directory, "store.json"));
  await store.init();
  const chromePath =
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/chromium";
  const app = createApp(store, {
    clientUrl: "http://localhost:3000",
    adminEmail: "admin@example.test",
    adminPassword: "test-password",
    sessionSecret: "test-secret-with-enough-entropy-for-the-test",
    production: false,
    uploadDir: join(directory, "uploads"),
    chromePath,
  });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const health = await fetch(`${base}/health`).then((response) => response.json());
  assert.equal(health.storage, "local-json");
  assert.equal(health.adminConfigured, true);

  const form = new FormData();
  for (const [key, value] of Object.entries({
    documentTypeId: "indigency",
    firstName: "Maria",
    middleName: "",
    lastName: "Santos",
    suffix: "",
    age: "32",
    mobileNumber: "0912345678",
    street: "Purok 1",
    barangay: "Jugan",
    city: "Consolacion",
    province: "Cebu",
    purpose: "Scholarship application",
  })) {
    form.append(key, value);
  }
  const image = new Blob([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])], {
    type: "image/png",
  });
  for (const kind of ["frontId", "backId", "residencyProof"])
    form.append(kind, image, `${kind}.png`);
  const submittedResponse = await fetch(`${base}/requests`, { method: "POST", body: form });
  assert.equal(submittedResponse.status, 201);
  const submitted = await submittedResponse.json();
  assert.match(submitted.trackingCode, /^JG-[A-F0-9]{10}$/);

  const trackingResponse = await fetch(`${base}/track/${submitted.trackingCode}`);
  assert.equal(trackingResponse.status, 200);
  const tracking = await trackingResponse.json();
  assert.equal(tracking.status, "submitted");
  assert.equal(JSON.stringify(tracking).includes("0912345678"), false);
  assert.equal(JSON.stringify(tracking).includes("Maria"), false);

  const blocked = await fetch(`${base}/admin/requests`);
  assert.equal(blocked.status, 401);
  const login = await fetch(`${base}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.test", password: "test-password" }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const headers = { Cookie: cookie, "Content-Type": "application/json" };
  const listedResponse = await fetch(`${base}/admin/requests`, { headers });
  assert.equal(listedResponse.status, 200);
  const listed = await listedResponse.json();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].attachments.length, 3);
  const requestId = listed[0].id;

  const invalidTransition = await fetch(`${base}/admin/requests/${requestId}/status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ status: "released" }),
  });
  assert.equal(invalidTransition.status, 400);
  const unconfirmedApproval = await fetch(`${base}/admin/requests/${requestId}/status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ status: "reviewing" }),
  });
  assert.equal(unconfirmedApproval.status, 200);
  const missingConfirmation = await fetch(`${base}/admin/requests/${requestId}/status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ status: "approved" }),
  });
  assert.equal(missingConfirmation.status, 400);
  for (const status of ["approved"]) {
    const response = await fetch(`${base}/admin/requests/${requestId}/status`, {
      method: "POST",
      headers,
      body: JSON.stringify({ status, note: "Reviewed by staff", confirmed: true }),
    });
    assert.equal(response.status, 200);
    const detail = await response.json();
    assert.equal(detail.history.at(-1).performedBy, "admin@example.test");
    assert.match(detail.history.at(-1).confirmation, /checked the submitted details/);
  }
  const updatedTrack = await fetch(`${base}/track/${submitted.trackingCode}`).then((response) =>
    response.json()
  );
  assert.equal(updatedTrack.status, "approved");
  assert.equal(updatedTrack.history.length, 3);
  assert.equal(JSON.stringify(updatedTrack).includes("performedBy"), false);
  assert.equal(JSON.stringify(updatedTrack).includes("confirmation"), false);

  const attachment = await fetch(
    `${base}/admin/requests/${requestId}/attachments/${listed[0].attachments[0].id}`,
    { headers }
  );
  assert.equal(attachment.status, 200);
  assert.equal(attachment.headers.get("content-type"), "image/png");

  if (existsSync(chromePath)) {
    const pdf = await fetch(`${base}/admin/requests/${requestId}/pdf`, { headers });
    assert.equal(pdf.status, 200);
    const bytes = Buffer.from(await pdf.arrayBuffer());
    assert.equal(bytes.toString("ascii", 0, 4), "%PDF");
  }

  for (const status of ["ready", "released"]) {
    const missingCheck = await fetch(`${base}/admin/requests/${requestId}/status`, {
      method: "POST",
      headers,
      body: JSON.stringify({ status }),
    });
    assert.equal(missingCheck.status, 400);
    const checked = await fetch(`${base}/admin/requests/${requestId}/status`, {
      method: "POST",
      headers,
      body: JSON.stringify({ status, confirmed: true }),
    });
    assert.equal(checked.status, 200);
  }
  const closedEdit = await fetch(`${base}/admin/requests/${requestId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      documentTypeId: "indigency", firstName: "Maria", middleName: "", lastName: "Santos",
      suffix: "", age: 32, mobileNumber: "0912345678", street: "Purok 1",
      barangay: "Jugan", city: "Consolacion", province: "Cebu", purpose: "Scholarship application",
    }),
  });
  assert.equal(closedEdit.status, 409);

  const secondSubmission = await fetch(`${base}/requests`, { method: "POST", body: form });
  assert.equal(secondSubmission.status, 201);
  const second = await secondSubmission.json();
  const requests = await fetch(`${base}/admin/requests`, { headers }).then((response) => response.json());
  const secondId = requests.find((item) => item.trackingCode === second.trackingCode).id;
  const noReason = await fetch(`${base}/admin/requests/${secondId}/status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ status: "rejected" }),
  });
  assert.equal(noReason.status, 400);
  const declined = await fetch(`${base}/admin/requests/${secondId}/status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ status: "rejected", note: "Please contact the barangay office." }),
  });
  assert.equal(declined.status, 200);
  const declinedTracking = await fetch(`${base}/track/${second.trackingCode}`).then((response) => response.json());
  assert.equal(declinedTracking.status, "rejected");
  assert.equal(declinedTracking.history.at(-1).note, "Please contact the barangay office.");
  assert.equal(JSON.stringify(declinedTracking).includes("performedBy"), false);
});

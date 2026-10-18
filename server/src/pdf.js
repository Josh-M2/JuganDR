import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const defaultChrome =
  process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "/usr/bin/chromium";

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeZone: "Asia/Manila" }).format(
    new Date(value)
  );
}

function renderHtml(request) {
  const person = request.applicant;
  const fullName = [person.firstName, person.middleName, person.lastName, person.suffix]
    .filter(Boolean)
    .join(" ");
  const address = [person.street, person.barangay, person.city, person.province]
    .filter(Boolean)
    .join(", ");
  const safeName = escapeHtml(fullName);
  const safeAddress = escapeHtml(address);
  const safePurpose = escapeHtml(request.purpose);
  const title = escapeHtml(request.documentType.name);
  const wording = {
    indigency: `This draft records the request of <strong>${safeName}</strong>, ${person.age} years old, for a Certificate of Indigency for ${safePurpose}. Eligibility must be verified by authorized staff before issuance.`,
    "barangay-certificate": `This draft records the request of <strong>${safeName}</strong> for a Barangay Certificate for ${safePurpose}. The specific fact to be certified must be confirmed by authorized staff.`,
    "barangay-clearance": `This draft records the request of <strong>${safeName}</strong> for Barangay Clearance for ${safePurpose}. Any clearance finding must be checked against official records before issuance.`,
    "senior-citizen": `This draft records the request of <strong>${safeName}</strong>, ${person.age} years old, for Senior Citizen certification for ${safePurpose}. Age and eligibility must be verified before issuance.`,
    "business-permit": `This draft records the request of <strong>${safeName}</strong> for a Barangay Business Permit for ${safePurpose}. Business details and local requirements must be verified before issuance.`,
    "no-claims-conflict": `This draft records the request of <strong>${safeName}</strong> for a No Claims and Conflict Certificate for ${safePurpose}. Any statement about claims or conflicts must be checked against official records.`,
    residency: `This draft records the request of <strong>${safeName}</strong> for a Certificate of Residency for ${safePurpose}. Residence must be verified before issuance.`,
  }[request.documentTypeId];

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; } body { font-family: Georgia, serif; color: #17213a; margin: 0; }
    .top { text-align: center; border-bottom: 3px solid #1d5d68; padding-bottom: 22px; }
    .eyebrow { font: 700 11px Arial, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #1d5d68; }
    h1 { font-size: 30px; margin: 12px 0 8px; } .place { font: 15px Arial, sans-serif; margin: 4px; }
    .meta { display: flex; justify-content: space-between; font: 12px Arial, sans-serif; color: #526173; margin: 30px 0 50px; }
    .body { font-size: 18px; line-height: 1.9; text-align: justify; min-height: 380px; }
    .signature { width: 260px; margin: 10px 0 0 auto; text-align: center; font: 13px Arial, sans-serif; }
    .line { border-top: 1px solid #17213a; padding-top: 8px; margin-top: 70px; }
    footer { border-top: 1px solid #d6dce2; margin-top: 65px; padding-top: 15px; color: #69798a; font: 11px Arial, sans-serif; }
    .draft { color: #9b392e; font: 700 12px Arial, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
    .draft-banner { color: #9b392e; font: 700 14px Arial, sans-serif; letter-spacing: .16em; margin: 20px 0 0; text-align: center; }
  </style></head><body><header class="top"><div class="eyebrow">Republic of the Philippines</div><p class="place">Province of Cebu · Municipality of Consolacion</p><p class="place">Barangay Jugan</p><h1>${title}</h1></header>
  <p class="draft-banner">Unsigned draft · for staff review only</p>
  <div class="meta"><span>Reference: ${escapeHtml(
    request.trackingCode
  )}</span><span>Prepared: ${formatDate(new Date())}</span></div>
  <section class="body"><p>To whom it may concern:</p><p>${wording}</p><p>Applicant-stated address: ${safeAddress}.</p><p>Confirm the official wording, findings, and signatory before issuance.</p></section>
  <div class="signature"><div class="line">Proposed signatory placement</div><p>Officer and seal details pending approval</p></div>
  <footer><span class="draft">Draft for staff review only · not for release</span><p>Request received ${formatDate(
    request.requestedAt
  )}. This unsigned copy is not an issued government certificate.</p></footer></body></html>`;
}

export async function generatePdf(request, chromePath = process.env.CHROME_PATH || defaultChrome) {
  const directory = await mkdtemp(join(tmpdir(), "jugan-pdf-"));
  const htmlFile = join(directory, "certificate.html");
  const pdfFile = join(directory, "certificate.pdf");
  try {
    await writeFile(htmlFile, renderHtml(request), { mode: 0o600 });
    await new Promise((resolve, reject) => {
      const args = [
        "--headless=new",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-pdf-header-footer",
        `--user-data-dir=${join(directory, "profile")}`,
        `--print-to-pdf=${pdfFile}`,
        pathToFileURL(htmlFile).href,
      ];
      if (process.env.CHROME_NO_SANDBOX === "1") args.unshift("--no-sandbox");
      const child = spawn(chromePath, args, { stdio: "ignore" });
      const timeout = setTimeout(() => child.kill("SIGKILL"), 20000);
      child.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.once("exit", (code) => {
        clearTimeout(timeout);
        code === 0 ? resolve() : reject(new Error(`Chrome exited with code ${code}`));
      });
    });
    return await readFile(pdfFile);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

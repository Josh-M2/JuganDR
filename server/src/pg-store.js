import { randomBytes, randomUUID } from "node:crypto";
import pg from "pg";
import { getDocumentType, nextStatuses } from "./domain.js";

const { Pool } = pg;
const iso = (value) => value instanceof Date ? value.toISOString() : value;
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

function mapRequest(row) {
  return {
    id: row.id,
    applicantId: row.applicant_id,
    documentTypeId: row.document_type_id,
    purpose: row.purpose,
    status: row.status,
    trackingCode: row.tracking_code,
    requestedAt: iso(row.requested_at),
    updatedAt: iso(row.updated_at),
    releasedAt: row.released_at ? iso(row.released_at) : null,
    adminNote: row.admin_note,
    applicant: {
      id: row.applicant_id,
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      suffix: row.suffix,
      age: row.age,
      mobileNumber: row.mobile_number,
      street: row.street,
      barangay: row.barangay,
      city: row.city,
      province: row.province,
    },
    documentType: getDocumentType(row.document_type_id),
    attachments: [],
    history: [],
  };
}

const requestColumns = `
  r.id, r.applicant_id, r.document_type_id, r.purpose, r.status,
  r.tracking_code, r.requested_at, r.updated_at, r.released_at, r.admin_note,
  a.first_name, a.middle_name, a.last_name, a.suffix, a.age,
  a.mobile_number, a.street, a.barangay, a.city, a.province`;

export class PgStore {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString: connectionString.replace("sslmode=require", "sslmode=verify-full"),
      max: 5,
    });
    this.pool.on("error", (error) => console.error("Postgres idle connection error", error));
  }

  async init() {
    await this.pool.query("SELECT 1 FROM document_types LIMIT 1");
  }

  async close() {
    await this.pool.end();
  }

  async withTransaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async createRequest(value, files) {
    const applicantId = randomUUID();
    const requestId = randomUUID();
    const trackingCode = `JG-${randomBytes(5).toString("hex").toUpperCase()}`;
    const { documentTypeId, purpose, ...applicant } = value;
    await this.withTransaction(async (client) => {
      await client.query(`
        INSERT INTO applicants
          (id, first_name, middle_name, last_name, suffix, age, mobile_number,
           street, barangay, city, province)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
        applicantId, applicant.firstName, applicant.middleName, applicant.lastName,
        applicant.suffix, applicant.age, applicant.mobileNumber, applicant.street,
        applicant.barangay, applicant.city, applicant.province,
      ]);
      await client.query(`
        INSERT INTO requests
          (id, applicant_id, document_type_id, purpose, tracking_code)
        VALUES ($1,$2,$3,$4,$5)`, [
        requestId, applicantId, documentTypeId, purpose, trackingCode,
      ]);
      await client.query(`
        INSERT INTO request_status_events (id, request_id, status, note)
        VALUES ($1,$2,'submitted','Request received')`, [randomUUID(), requestId]);
      for (const file of files) {
        await client.query(`
          INSERT INTO attachments
            (id, request_id, kind, storage_key, original_name, mime_type, size_bytes)
          VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
          randomUUID(), requestId, file.kind, file.storedName, file.originalName,
          file.mimeType, file.size,
        ]);
      }
    });
    return this.getRequest(requestId);
  }

  async loadRequests(where = "", params = []) {
    const { rows } = await this.pool.query(`
      SELECT ${requestColumns}
      FROM requests r JOIN applicants a ON a.id = r.applicant_id
      ${where}
      ORDER BY r.requested_at DESC, r.id DESC`, params);
    if (!rows.length) return [];
    const result = rows.map(mapRequest);
    const byId = new Map(result.map((item) => [item.id, item]));
    const ids = result.map((item) => item.id);
    const [attachments, events] = await Promise.all([
      this.pool.query(`
        SELECT id, request_id, kind, storage_key, original_name, mime_type,
          size_bytes, uploaded_at FROM attachments WHERE request_id = ANY($1::uuid[])
        ORDER BY uploaded_at, id`, [ids]),
      this.pool.query(`
        SELECT id, request_id, status, note, confirmation, performed_by, created_at
        FROM request_status_events WHERE request_id = ANY($1::uuid[])
        ORDER BY created_at, id`, [ids]),
    ]);
    for (const row of attachments.rows) {
      byId.get(row.request_id).attachments.push({
        id: row.id, requestId: row.request_id, kind: row.kind,
        originalName: row.original_name, mimeType: row.mime_type,
        size: row.size_bytes, uploadedAt: iso(row.uploaded_at),
      });
    }
    for (const row of events.rows) {
      byId.get(row.request_id).history.push({
        id: row.id, requestId: row.request_id, status: row.status,
        note: row.note, confirmation: row.confirmation,
        performedBy: row.performed_by, createdAt: iso(row.created_at),
      });
    }
    return result;
  }

  async listRequests(status) {
    return this.loadRequests(status ? "WHERE r.status = $1" : "", status ? [status] : []);
  }

  async getRequest(id) {
    if (!isUuid(id)) return null;
    return (await this.loadRequests("WHERE r.id = $1", [id]))[0] || null;
  }

  async track(code) {
    const { rows } = await this.pool.query(`
      SELECT r.id, r.tracking_code, r.document_type_id, r.status,
        r.requested_at, r.updated_at
      FROM requests r WHERE r.tracking_code = $1`, [code.toUpperCase()]);
    const request = rows[0];
    if (!request) return null;
    const events = await this.pool.query(`
      SELECT status, note, created_at FROM request_status_events
      WHERE request_id = $1 ORDER BY created_at, id`, [request.id]);
    return {
      trackingCode: request.tracking_code,
      documentType: getDocumentType(request.document_type_id)?.name,
      status: request.status,
      requestedAt: iso(request.requested_at),
      updatedAt: iso(request.updated_at),
      history: events.rows.map((item) => ({
        status: item.status, note: item.note, createdAt: iso(item.created_at),
      })),
    };
  }

  async updateStatus(id, status, note, confirmation = "", performedBy = "") {
    if (!isUuid(id)) return null;
    const found = await this.withTransaction(async (client) => {
      const { rows } = await client.query("SELECT status FROM requests WHERE id = $1 FOR UPDATE", [id]);
      if (!rows.length) return false;
      if (!nextStatuses[rows[0].status]?.includes(status)) {
        const error = new Error(`Cannot move from ${rows[0].status} to ${status}.`);
        error.status = 400;
        throw error;
      }
      await client.query(`
        UPDATE requests SET status = $2::request_status, updated_at = now(),
          released_at = CASE WHEN $2::request_status = 'released' THEN now() ELSE released_at END,
          admin_note = CASE WHEN $3 <> '' THEN $3 ELSE admin_note END
        WHERE id = $1`, [id, status, note]);
      await client.query(`
        INSERT INTO request_status_events
          (id, request_id, status, note, confirmation, performed_by)
        VALUES ($1,$2,$3,$4,$5,$6)`, [
        randomUUID(), id, status, note, confirmation, performedBy,
      ]);
      return true;
    });
    return found ? this.getRequest(id) : null;
  }

  async updateDetails(id, value) {
    if (!isUuid(id)) return null;
    const found = await this.withTransaction(async (client) => {
      const { rows } = await client.query(`
        SELECT applicant_id, status FROM requests WHERE id = $1 FOR UPDATE`, [id]);
      if (!rows.length) return false;
      if (["released", "rejected"].includes(rows[0].status)) {
        const error = new Error("Details cannot be edited after a request is closed.");
        error.status = 409;
        throw error;
      }
      const { documentTypeId, purpose, ...applicant } = value;
      await client.query(`
        UPDATE applicants SET first_name=$2, middle_name=$3, last_name=$4,
          suffix=$5, age=$6, mobile_number=$7, street=$8, barangay=$9,
          city=$10, province=$11 WHERE id=$1`, [
        rows[0].applicant_id, applicant.firstName, applicant.middleName,
        applicant.lastName, applicant.suffix, applicant.age,
        applicant.mobileNumber, applicant.street, applicant.barangay,
        applicant.city, applicant.province,
      ]);
      await client.query(`
        UPDATE requests SET document_type_id=$2, purpose=$3, updated_at=now()
        WHERE id=$1`, [id, documentTypeId, purpose]);
      return true;
    });
    return found ? this.getRequest(id) : null;
  }

  async getAttachment(requestId, attachmentId) {
    if (!isUuid(requestId) || !isUuid(attachmentId)) return null;
    const { rows } = await this.pool.query(`
      SELECT id, request_id, kind, storage_key, original_name, mime_type,
        size_bytes, uploaded_at FROM attachments
      WHERE request_id=$1 AND id=$2`, [requestId, attachmentId]);
    const row = rows[0];
    return row ? {
      id: row.id, requestId: row.request_id, kind: row.kind,
      storedName: row.storage_key, originalName: row.original_name,
      mimeType: row.mime_type, size: row.size_bytes,
      uploadedAt: iso(row.uploaded_at),
    } : null;
  }
}

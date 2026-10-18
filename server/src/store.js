import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getDocumentType, nextStatuses } from "./domain.js";

const emptyState = () => ({
  version: 1,
  applicants: [],
  requests: [],
  attachments: [],
  statusEvents: [],
});

export class JsonStore {
  constructor(file) {
    this.file = file;
    this.queue = Promise.resolve();
  }

  async init() {
    await mkdir(dirname(this.file), { recursive: true, mode: 0o700 });
    try {
      await writeFile(this.file, JSON.stringify(emptyState(), null, 2), {
        flag: "wx",
        mode: 0o600,
      });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }

  async read() {
    return JSON.parse(await readFile(this.file, "utf8"));
  }

  async mutate(change) {
    const operation = this.queue.then(async () => {
      const state = await this.read();
      const result = await change(state);
      const temporaryFile = `${this.file}.${randomUUID()}.tmp`;
      await writeFile(temporaryFile, JSON.stringify(state, null, 2), { mode: 0o600 });
      await rename(temporaryFile, this.file);
      return result;
    });
    this.queue = operation.catch(() => {});
    return operation;
  }

  hydrate(state, request) {
    if (!request) return null;
    return {
      ...request,
      applicant: state.applicants.find((item) => item.id === request.applicantId),
      documentType: getDocumentType(request.documentTypeId),
      attachments: state.attachments
        .filter((item) => item.requestId === request.id)
        .map(({ storedName, ...item }) => item),
      history: state.statusEvents
        .filter((item) => item.requestId === request.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    };
  }

  async createRequest(value, files) {
    return this.mutate((state) => {
      const now = new Date().toISOString();
      const applicantId = randomUUID();
      const requestId = randomUUID();
      let trackingCode;
      do {
        trackingCode = `JG-${randomBytes(5).toString("hex").toUpperCase()}`;
      } while (state.requests.some((item) => item.trackingCode === trackingCode));
      const { documentTypeId, purpose, ...applicantFields } = value;
      state.applicants.push({ id: applicantId, ...applicantFields });
      const request = {
        id: requestId,
        applicantId,
        documentTypeId,
        purpose,
        status: "submitted",
        trackingCode,
        requestedAt: now,
        updatedAt: now,
        releasedAt: null,
        adminNote: "",
      };
      state.requests.push(request);
      state.statusEvents.push({
        id: randomUUID(),
        requestId,
        status: "submitted",
        note: "Request received",
        createdAt: now,
      });
      for (const file of files)
        state.attachments.push({ id: randomUUID(), requestId, ...file, uploadedAt: now });
      return this.hydrate(state, request);
    });
  }

  async listRequests(status) {
    const state = await this.read();
    return state.requests
      .filter((item) => !status || item.status === status)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
      .map((item) => this.hydrate(state, item));
  }

  async getRequest(id) {
    const state = await this.read();
    return this.hydrate(
      state,
      state.requests.find((item) => item.id === id)
    );
  }

  async track(code) {
    const state = await this.read();
    const request = state.requests.find((item) => item.trackingCode === code.toUpperCase());
    if (!request) return null;
    return {
      trackingCode: request.trackingCode,
      documentType: getDocumentType(request.documentTypeId)?.name,
      status: request.status,
      requestedAt: request.requestedAt,
      updatedAt: request.updatedAt,
      history: state.statusEvents
        .filter((item) => item.requestId === request.id)
        .map(({ status, note, createdAt }) => ({ status, note, createdAt })),
    };
  }

  async updateStatus(id, status, note, confirmation = "", performedBy = "") {
    return this.mutate((state) => {
      const request = state.requests.find((item) => item.id === id);
      if (!request) return null;
      if (!nextStatuses[request.status]?.includes(status)) {
        const error = new Error(`Cannot move from ${request.status} to ${status}.`);
        error.status = 400;
        throw error;
      }
      const now = new Date().toISOString();
      request.status = status;
      request.updatedAt = now;
      if (status === "released") request.releasedAt = now;
      if (note) request.adminNote = note;
      state.statusEvents.push({
        id: randomUUID(), requestId: id, status, note, confirmation, performedBy, createdAt: now,
      });
      return this.hydrate(state, request);
    });
  }

  async updateDetails(id, value) {
    return this.mutate((state) => {
      const request = state.requests.find((item) => item.id === id);
      if (!request) return null;
      if (["released", "rejected"].includes(request.status)) {
        const error = new Error("Details cannot be edited after a request is closed.");
        error.status = 409;
        throw error;
      }
      const applicant = state.applicants.find((item) => item.id === request.applicantId);
      const { documentTypeId, purpose, ...applicantFields } = value;
      Object.assign(applicant, applicantFields);
      request.documentTypeId = documentTypeId;
      request.purpose = purpose;
      request.updatedAt = new Date().toISOString();
      return this.hydrate(state, request);
    });
  }

  async getAttachment(requestId, attachmentId) {
    const state = await this.read();
    return (
      state.attachments.find((item) => item.requestId === requestId && item.id === attachmentId) ||
      null
    );
  }
}

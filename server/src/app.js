import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  adminIsConfigured,
  clearSession,
  credentialsMatch,
  issueSession,
  requireAdmin,
} from "./auth.js";
import { documentTypes, nextStatuses, staffConfirmations, statuses } from "./domain.js";
import { generatePdf } from "./pdf.js";
import { LocalFileStorage, parseUpload } from "./uploads.js";
import { sealDashboardQuery, sealTrackingQuery } from "./realtime.js";
import { validateAdminEdit, validateRequest } from "./validation.js";

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const submitLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export function createApp(store, config) {
  const app = express();
  const uploads = config.storage || new LocalFileStorage(config.uploadDir);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      storage: config.storageMode || "local-json",
      realtime: Boolean(config.realtime),
      adminConfigured: adminIsConfigured(config),
      pdfAvailable: existsSync(config.chromePath),
    });
  });

  app.get("/api/document-types", (_req, res) => res.json(documentTypes));

  app.post("/api/requests", submitLimit, parseUpload, async (req, res, next) => {
    try {
      const { value, errors } = validateRequest(req.body);
      if (Object.keys(errors).length)
        return res.status(400).json({ error: "Check the highlighted fields.", fields: errors });
      const files = await uploads.save(req.files);
      try {
        const request = await store.createRequest(value, files);
        res
          .status(201)
          .json({
            trackingCode: request.trackingCode,
            status: request.status,
            requestedAt: request.requestedAt,
          });
      } catch (error) {
        await uploads.remove(files);
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/track/:code", async (req, res, next) => {
    try {
      const code = req.params.code.trim().toUpperCase();
      if (!/^JG-[A-F0-9]{10}$/.test(code))
        return res.status(400).json({ error: "Enter a valid tracking code." });
      const result = await store.track(code);
      if (!result)
        return res.status(404).json({ error: "No request was found for this tracking code." });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/live/track/:code", async (req, res, next) => {
    try {
      if (!config.realtime) return res.status(503).json({ error: "Live updates are unavailable." });
      const code = req.params.code.trim().toUpperCase();
      if (!/^JG-[A-F0-9]{10}$/.test(code))
        return res.status(400).json({ error: "Enter a valid tracking code." });
      if (!(await store.track(code)))
        return res.status(404).json({ error: "No request was found for this tracking code." });
      res.set("Cache-Control", "no-store");
      res.json({ sealedQuery: await sealTrackingQuery(config.realtime, code), url: config.realtimeUrl });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/login", loginLimit, (req, res) => {
    if (!adminIsConfigured(config))
      return res
        .status(503)
        .json({ error: "Admin login is not configured. Run pnpm run setup:admin." });
    if (!credentialsMatch(req.body?.email, req.body?.password, config)) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }
    issueSession(res, config);
    res.json({ email: config.adminEmail });
  });

  app.post("/api/admin/logout", (_req, res) => {
    clearSession(res, config);
    res.json({ success: true });
  });

  app.use("/api/admin", requireAdmin(config));

  app.get("/api/admin/me", (req, res) => res.json(req.admin));

  app.get("/api/admin/requests", async (req, res, next) => {
    try {
      const status = req.query.status;
      if (status && !statuses.includes(status))
        return res.status(400).json({ error: "Invalid status filter." });
      res.json(await store.listRequests(status));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/live/requests", async (_req, res, next) => {
    try {
      if (!config.realtime) return res.status(503).json({ error: "Live updates are unavailable." });
      res.set("Cache-Control", "no-store");
      res.json({ sealedQuery: await sealDashboardQuery(config.realtime), url: config.realtimeUrl });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/requests/:id", async (req, res, next) => {
    try {
      const request = await store.getRequest(req.params.id);
      if (!request) return res.status(404).json({ error: "Request not found." });
      res.json({ ...request, nextStatuses: nextStatuses[request.status], staffConfirmations });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/requests/:id", async (req, res, next) => {
    try {
      const { value, errors } = validateAdminEdit(req.body);
      if (Object.keys(errors).length)
        return res.status(400).json({ error: "Check the highlighted fields.", fields: errors });
      const request = await store.updateDetails(req.params.id, value);
      if (!request) return res.status(404).json({ error: "Request not found." });
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/requests/:id/status", async (req, res, next) => {
    try {
      const status = typeof req.body?.status === "string" ? req.body.status : "";
      const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";
      if (!statuses.includes(status))
        return res.status(400).json({ error: "Choose a valid status." });
      if (status === "rejected" && !note)
        return res.status(400).json({ error: "Add a reason before rejecting a request." });
      if (staffConfirmations[status] && req.body?.confirmed !== true)
        return res.status(400).json({ error: "Confirm the staff check before changing this status." });
      if (note.length > 500)
        return res.status(400).json({ error: "Keep the note under 500 characters." });
      const request = await store.updateStatus(
        req.params.id,
        status,
        note,
        staffConfirmations[status] || "",
        req.admin.email
      );
      if (!request) return res.status(404).json({ error: "Request not found." });
      res.json({ ...request, nextStatuses: nextStatuses[request.status], staffConfirmations });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/requests/:id/attachments/:attachmentId", async (req, res, next) => {
    try {
      const attachment = await store.getAttachment(req.params.id, req.params.attachmentId);
      if (!attachment) return res.status(404).json({ error: "Attachment not found." });
      const bytes = await uploads.read(attachment);
      res.set("Content-Type", attachment.mimeType);
      res.set("Cache-Control", "no-store");
      res.send(bytes);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/requests/:id/pdf", async (req, res, next) => {
    try {
      const request = await store.getRequest(req.params.id);
      if (!request) return res.status(404).json({ error: "Request not found." });
      if (!["approved", "ready", "released"].includes(request.status)) {
        return res
          .status(409)
          .json({ error: "Approve the request before preparing a certificate." });
      }
      if (!existsSync(config.chromePath))
        return res
          .status(503)
          .json({ error: "Chrome is unavailable. Set CHROME_PATH on the server." });
      const pdf = await generatePdf(request, config.chromePath);
      res.set("Content-Type", "application/pdf");
      res.set("Cache-Control", "no-store");
      res.set("Content-Disposition", `attachment; filename="${request.trackingCode}.pdf"`);
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    if (!error.status || error.status >= 500) console.error(error);
    res
      .status(error.status || 500)
      .json({ error: error.status ? error.message : "Unexpected server error." });
  });

  return app;
}

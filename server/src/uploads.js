import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import Busboy from "busboy";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function parseUpload(req, _res, next) {
  let parser;
  try {
    parser = Busboy({
      headers: req.headers,
      limits: { fileSize: 5 * 1024 * 1024, files: 3, fields: 20, fieldSize: 1000 },
    });
  } catch {
    const error = new Error("Send the request as a multipart form.");
    error.status = 415;
    return next(error);
  }
  const files = {};
  const fields = {};
  const seen = new Set();
  let uploadError = null;
  let completed = false;
  const finish = (error) => {
    if (completed) return;
    completed = true;
    next(error);
  };
  const fail = (message, status = 400) => {
    if (!uploadError) {
      uploadError = new Error(message);
      uploadError.status = status;
    }
  };
  parser.on("field", (name, value) => {
    fields[name] = value;
  });
  parser.on("file", (name, stream, info) => {
    if (!["frontId", "backId", "residencyProof"].includes(name) || seen.has(name))
      fail("Unexpected or duplicate attachment.");
    seen.add(name);
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("limit", () => fail("Each attachment must be 5 MB or smaller.", 413));
    stream.on("end", () => {
      files[name] = [
        {
          buffer: Buffer.concat(chunks),
          originalname: info.filename || "attachment",
          size: chunks.reduce((sum, chunk) => sum + chunk.length, 0),
        },
      ];
    });
  });
  parser.on("filesLimit", () => fail("Upload only the three required attachments."));
  parser.on("fieldsLimit", () => fail("Too many form fields."));
  parser.on("error", finish);
  parser.on("close", () => {
    if (uploadError) return finish(uploadError);
    req.body = fields;
    req.files = files;
    finish();
  });
  req.pipe(parser);
}

function detectedType(buffer) {
  if (buffer.subarray(0, 4).equals(Buffer.from([0x25, 0x50, 0x44, 0x46])))
    return ["application/pdf", ".pdf"];
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return ["image/png", ".png"];
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return ["image/jpeg", ".jpg"];
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP")
    return ["image/webp", ".webp"];
  return null;
}

export function validateUploads(files) {
  const required = ["frontId", "backId", "residencyProof"];
  const validated = [];
  for (const kind of required) {
    if (!files?.[kind]?.[0]) {
      const error = new Error("Upload the front and back of an ID and proof of residency.");
      error.status = 400;
      throw error;
    }
    const file = files[kind][0];
    const type = detectedType(file.buffer);
    if (!type) {
      const error = new Error("Attachments must be PDF, PNG, JPEG, or WebP files.");
      error.status = 400;
      throw error;
    }
    validated.push({ kind, file, mimeType: type[0], extension: type[1] });
  }
  return validated;
}

function attachmentMetadata({ kind, file, mimeType, extension }) {
  return {
    kind,
    storedName: `${randomUUID()}${extension}`,
    originalName: file.originalname.slice(0, 120),
    mimeType,
    size: file.size,
  };
}

export class LocalFileStorage {
  constructor(directory) {
    this.directory = directory;
  }

  async save(files) {
    const validated = validateUploads(files);
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const saved = [];
    try {
      for (const entry of validated) {
        const metadata = attachmentMetadata(entry);
        await writeFile(join(this.directory, metadata.storedName), entry.file.buffer, {
          flag: "wx", mode: 0o600,
        });
        saved.push(metadata);
      }
      return saved;
    } catch (error) {
      await this.remove(saved);
      throw error;
    }
  }

  async remove(files) {
    await Promise.all(files.map((file) => rm(join(this.directory, file.storedName), { force: true })));
  }

  async read(file) {
    return readFile(join(this.directory, file.storedName));
  }
}

export class NeonObjectStorage {
  constructor(bucket) {
    this.bucket = bucket;
    this.s3 = new S3Client({ forcePathStyle: true });
  }

  async save(files) {
    const validated = validateUploads(files);
    const saved = [];
    try {
      for (const entry of validated) {
        const metadata = attachmentMetadata(entry);
        metadata.storedName = `requests/${metadata.storedName}`;
        await this.s3.send(new PutObjectCommand({
          Bucket: this.bucket,
          Key: metadata.storedName,
          Body: entry.file.buffer,
          ContentType: metadata.mimeType,
        }));
        saved.push(metadata);
      }
      return saved;
    } catch (error) {
      await this.remove(saved);
      throw error;
    }
  }

  async remove(files) {
    await Promise.all(files.map((file) => this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket, Key: file.storedName,
    }))));
  }

  async read(file) {
    const result = await this.s3.send(new GetObjectCommand({
      Bucket: this.bucket, Key: file.storedName,
    }));
    return Buffer.from(await result.Body.transformToByteArray());
  }
}

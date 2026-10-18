import { createHmac, timingSafeEqual } from "node:crypto";

const cookieName = "jugan_session";
const sessionDurationMs = 8 * 60 * 60 * 1000;

function sign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function adminIsConfigured(config) {
  return Boolean(config.adminEmail && config.adminPassword && config.sessionSecret);
}

export function credentialsMatch(email, password, config) {
  if (!adminIsConfigured(config) || typeof email !== "string" || typeof password !== "string")
    return false;
  const submitted = createHmac("sha256", config.sessionSecret).update(password).digest();
  const expected = createHmac("sha256", config.sessionSecret).update(config.adminPassword).digest();
  return (
    email.trim().toLowerCase() === config.adminEmail.toLowerCase() &&
    timingSafeEqual(submitted, expected)
  );
}

export function issueSession(res, config) {
  const payload = Buffer.from(
    JSON.stringify({ email: config.adminEmail, expiresAt: Date.now() + sessionDurationMs })
  ).toString("base64url");
  res.cookie(cookieName, `${payload}.${sign(payload, config.sessionSecret)}`, {
    httpOnly: true,
    secure: config.production,
    sameSite: "lax",
    path: "/api/admin",
    maxAge: sessionDurationMs,
  });
}

export function clearSession(res, config) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: config.production,
    sameSite: "lax",
    path: "/api/admin",
  });
}

export function requireAdmin(config) {
  return (req, res, next) => {
    if (!adminIsConfigured(config))
      return res.status(503).json({ error: "Admin login is not configured on the server." });
    const token = req.cookies?.[cookieName];
    if (typeof token !== "string")
      return res.status(401).json({ error: "Please sign in as an administrator." });
    const [payload, signature] = token.split(".");
    if (!payload || !signature)
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    const expected = sign(payload, config.sessionSecret);
    const actualBytes = Buffer.from(signature);
    const expectedBytes = Buffer.from(expected);
    if (
      actualBytes.length !== expectedBytes.length ||
      !timingSafeEqual(actualBytes, expectedBytes)
    ) {
      return res.status(401).json({ error: "Invalid session." });
    }
    try {
      const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      if (session.email !== config.adminEmail || session.expiresAt < Date.now())
        throw new Error("expired");
      req.admin = { email: session.email };
      next();
    } catch {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
  };
}

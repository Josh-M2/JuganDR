const baseUrl = (process.env.REACT_APP_API_URL || "http://localhost:3101/api").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const body = options.body;
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.error || `Request failed (${response.status}).`,
      response.status,
      payload?.fields
    );
  }
  return payload as T;
}

export async function apiBlob(path: string): Promise<Blob> {
  const response = await fetch(`${baseUrl}${path}`, { credentials: "include" });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(payload?.error || `Download failed (${response.status}).`, response.status);
  }
  return response.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

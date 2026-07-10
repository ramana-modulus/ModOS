/**
 * Minimal typed fetch client for the app's mock JSON API. Every endpoint
 * returns `{ data }` on success or `{ error }` on failure; this wrapper unwraps
 * the envelope and throws a typed `ApiRequestError` on non-2xx.
 */
import type { ApiEnvelope, ApiError } from "@/features/procurement/api/types";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

const BASE = "/api";

function toQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

async function parse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | ApiError | null;
  if (!res.ok) {
    const err = (body as ApiError | null)?.error;
    throw new ApiRequestError(err?.message ?? `Request failed (${res.status})`, res.status, err?.code);
  }
  if (!body || !("data" in body)) {
    throw new ApiRequestError("Malformed response envelope", res.status);
  }
  return body.data;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const res = await fetch(`${BASE}${path}${toQuery(params)}`, {
    headers: { Accept: "application/json" },
  });
  return parse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  return parse<T>(res);
}

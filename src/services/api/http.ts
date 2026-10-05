import "server-only";

/** Server-only HTTP client. The base URL is a server env var, never shipped to the browser. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number | "network" | "timeout" | "shape") {
    super(message);
    this.name = "ApiError";
  }
}

export function apiBaseUrl(): string | null {
  const url = process.env.TUTUSTAY_API_BASE_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
}

export async function apiGet(path: string, query: Record<string, string | number>, timeoutMs = 8000): Promise<unknown> {
  const base = apiBaseUrl();
  if (!base) throw new ApiError("TUTUSTAY_API_BASE_URL is not set", "network");
  const qs = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)])).toString();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${path}${qs ? `?${qs}` : ""}`, { signal: ctrl.signal, headers: { accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new ApiError(`GET ${path} failed`, res.status);
    return await res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(`GET ${path} ${e instanceof Error && e.name === "AbortError" ? "timed out" : "failed"}`, e instanceof Error && e.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }
}

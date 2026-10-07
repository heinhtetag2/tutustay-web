import "server-only";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Redis } from "@upstash/redis";
import type { FeedbackRecord } from "@/validation/feedback";

/**
 * Where feedback lives. On Vercel, add the Upstash Redis integration (Marketplace): its env vars switch this to Redis, which persists across deploys.
 * Without them (running locally) it falls back to one JSON object per line in ./.feedback/responses.jsonl. Vercel's own filesystem is ephemeral, so the file is never used there.
 */
const KEY = "tutustay:feedback";
const redisConfig = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
};
let redisClient: Redis | null = null;
const redis = (): Redis | null => {
  const cfg = redisConfig();
  if (!cfg) return null;
  return (redisClient ??= new Redis(cfg));
};

const dir = () => process.env.FEEDBACK_DIR ?? join(process.cwd(), ".feedback");
const file = () => join(dir(), "responses.jsonl");

export async function appendFeedback(record: FeedbackRecord): Promise<void> {
  const r = redis();
  if (r) { await r.rpush(KEY, JSON.stringify(record)); return; }
  if (process.env.VERCEL) throw new Error("No persistent store: connect Upstash Redis to this Vercel project");
  await mkdir(dir(), { recursive: true });
  await appendFile(file(), JSON.stringify(record) + "\n", "utf8");
}

export async function readFeedback(): Promise<FeedbackRecord[]> {
  const r = redis();
  let lines: string[];
  if (r) {
    const items = await r.lrange<unknown>(KEY, 0, -1);
    lines = items.map((i) => (typeof i === "string" ? i : JSON.stringify(i)));
  } else {
    try { lines = (await readFile(file(), "utf8")).split("\n"); } catch { return []; }
  }
  const out: FeedbackRecord[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line) as FeedbackRecord); } catch { /* skip a torn line */ }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Reading responses needs FEEDBACK_ADMIN_KEY in production. Without a key it is open in development only. */
export function canReadFeedback(key: string | null | undefined): boolean {
  const admin = process.env.FEEDBACK_ADMIN_KEY;
  if (admin) return key === admin;
  return process.env.NODE_ENV !== "production";
}

const cell = (v: unknown): string => {
  let s = v === undefined || v === null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replaceAll('"', '""')}"`;
};

export function feedbackToCsv(rows: FeedbackRecord[]): string {
  const cols = ["createdAt", "task", "kind", "ease", "message", "name", "team", "page", "device", "viewport", "locale", "id"] as const;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
}

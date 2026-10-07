import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { appendFeedback, canReadFeedback, feedbackToCsv, readFeedback } from "@/services/feedback.store";
import { feedbackSchema } from "@/validation/feedback";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    await appendFeedback({ ...parsed.data, id: randomUUID(), createdAt: new Date().toISOString(), userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300) });
  } catch {
    return NextResponse.json({ error: "save-failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

/** Export for the team: /api/feedback?key=…&format=csv (or json). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!canReadFeedback(url.searchParams.get("key"))) return new NextResponse("Not found", { status: 404 });
  const rows = await readFeedback();
  if (url.searchParams.get("format") === "json") return NextResponse.json(rows);
  return new NextResponse(feedbackToCsv(rows), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="tutustay-feedback.csv"' } });
}

import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { canReadFeedback, readFeedback } from "@/services/feedback.store";
import { Container, Section } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { FEEDBACK_KINDS, FEEDBACK_TASKS } from "@/validation/feedback";

export const metadata = { title: "What testers said", robots: { index: false } };
export const dynamic = "force-dynamic";

const TASK_LABEL: Record<string, string> = { search: "Searching", stay: "Stay and room", booking: "Booking", coupons: "Coupons", mybookings: "My bookings", account: "Account", help: "Help", other: "Other", compare: "Comparing (old)" };
const KIND_LABEL: Record<string, string> = { problem: "Couldn't do it", confusing: "Confusing", idea: "Idea", praise: "Worked well" };

export default async function FeedbackResults({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ key?: string }> }) {
  const { locale } = await params;
  const { key } = await searchParams;
  if (!isLocale(locale)) notFound();
  const rows = await readFeedback();
  // The page is open to everyone testing; only the CSV export needs the team password (?key=).
  const csv = canReadFeedback(key) ? `/api/feedback?format=csv&key=${encodeURIComponent(key ?? "")}` : null;

  // Lowest average ease first: the tasks to fix first.
  const byTask = FEEDBACK_TASKS.map((t) => {
    const r = rows.filter((x) => x.task === t);
    return { task: t, n: r.length, avg: r.length ? r.reduce((a, x) => a + x.ease, 0) / r.length : null, blocking: r.filter((x) => x.ease <= 2).length };
  }).filter((x) => x.n > 0).sort((a, b) => (a.avg ?? 9) - (b.avg ?? 9));

  return (
    <Container><Section>
      <PageHeader
        title="What testers said" back="/" description="Everyone testing can see this. Parts that people found hardest are listed first."
        actions={csv ? <a href={csv} className="type-label inline-flex min-h-11 items-center rounded-control border border-text-primary px-4 hover:bg-surface-subtle">Download CSV</a> : undefined}
      />
      {rows.length === 0 ? <p className="type-body text-text-secondary">No feedback yet. Use the Give feedback tab on the left edge of any page to add the first one.</p> : (
        <>
          <h2 className="type-heading mb-3">By task</h2>
          <div className="mb-8 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left">
              <thead className="type-label text-text-secondary"><tr><th className="py-2 pr-4">Task</th><th className="py-2 pr-4">Responses</th><th className="py-2 pr-4">Average ease (1-5)</th><th className="py-2">Hard or very hard</th></tr></thead>
              <tbody>{byTask.map((x) => (
                <tr key={x.task} className="border-t border-border-subtle type-body">
                  <td className="py-2 pr-4">{TASK_LABEL[x.task] ?? x.task}</td><td className="py-2 pr-4 tabular-nums">{x.n}</td>
                  <td className="py-2 pr-4 tabular-nums">{x.avg?.toFixed(1)}</td><td className="py-2 tabular-nums">{x.blocking}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          <h2 className="type-heading mb-3">All responses ({rows.length})</h2>
          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-card border border-border-subtle p-4">
                <p className="type-body-sm text-text-secondary">
                  {new Date(r.createdAt).toLocaleString("en-GB")} · {TASK_LABEL[r.task] ?? r.task} · <span className="type-label text-text-primary">{KIND_LABEL[r.kind] ?? r.kind}</span> · ease {r.ease}/5 · {r.device} ({r.viewport}) · {r.page}
                </p>
                <p className="type-body mt-2 whitespace-pre-wrap">{r.message}</p>
                {r.name || r.team ? <p className="type-body-sm mt-2 text-text-secondary">{[r.name, r.team].filter(Boolean).join(" · ")}</p> : null}
              </li>
            ))}
          </ul>
          <p className="type-body-sm mt-6 text-text-muted">Kinds: {FEEDBACK_KINDS.map((k) => KIND_LABEL[k]).join(", ")}.</p>
        </>
      )}
    </Section></Container>
  );
}

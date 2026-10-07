"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/I18nProvider";
import { closeFeedbackDialog, useFeedbackDialog } from "@/shared/hooks/useFeedbackDialog";
import { LocalLink } from "@/shared/components/LocalLink";
import { Button, LinkButton } from "@/shared/ui/Button";
import { Field, Input, Textarea } from "@/shared/ui/Field";
import { Select } from "@/shared/ui/Select";
import { FEEDBACK_KINDS, FEEDBACK_TASKS, FEEDBACK_TEAMS, feedbackSchema, type FeedbackInput } from "@/validation/feedback";

// Usability-test tool for the internal rounds: English only, kept out of the product's message catalogue on purpose.
// Task names follow the product journey and glossary (docs/02): Stay, Booking, My bookings, Coupons.
const TASKS: Record<(typeof FEEDBACK_TASKS)[number], string> = {
  search: "Searching for a stay", stay: "Viewing a stay and choosing a room", booking: "Booking a stay", coupons: "Coupons and deals",
  mybookings: "My bookings", account: "Account and sign in", help: "Help and support", other: "Something else",
};
const KINDS: Record<(typeof FEEDBACK_KINDS)[number], string> = { problem: "I couldn't do it", confusing: "It was confusing", idea: "I have an idea", praise: "It worked well" };
const TEAMS: Record<(typeof FEEDBACK_TEAMS)[number], string> = { support: "Support", ops: "Ops", sales: "Sales", tech: "Tech", other: "Other" };
const EASE = ["Very hard", "Hard", "OK", "Easy", "Very easy"];

/** Guess the task from the page the person is on, so most people never touch that question. */
function taskFor(pathname: string): (typeof FEEDBACK_TASKS)[number] {
  const p = pathname.replace(/^\/(en|my|ko)(?=\/|$)/, "") || "/";
  if (p.startsWith("/search")) return "search";
  if (/^\/stays\/[^/]+\/book/.test(p)) return "booking";
  if (p.startsWith("/stays/")) return "stay";
  if (p.startsWith("/account/promo-codes") || p.startsWith("/deals")) return "coupons";
  if (p.startsWith("/bookings/") || p.startsWith("/account/bookings")) return "mybookings";
  if (p.startsWith("/account") || /^\/(login|signup|forgot-password)/.test(p)) return "account";
  if (p.startsWith("/help")) return "help";
  return "search";
}

/** Collects usability feedback without leaving the page (native <dialog>). Mounted once in the layout; it never touches booking state. */
export function FeedbackDialog() {
  const open = useFeedbackDialog();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref} aria-label="Tell us how it went" onClose={closeFeedbackDialog}
      onClick={(e) => { if (e.target === ref.current) closeFeedbackDialog(); }}
      className="m-auto max-h-[92dvh] w-[min(94vw,34rem)] overflow-y-auto rounded-sheet bg-surface-raised p-0 text-text-primary shadow-high backdrop:bg-black/50"
    >
      {open ? (
        <div className="relative p-6 pt-14 sm:p-8 sm:pt-16">
          <button type="button" aria-label="Close" onClick={closeFeedbackDialog} className="absolute right-4 top-4 inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <FeedbackForm />
        </div>
      ) : null}
    </dialog>
  );
}

function FeedbackForm() {
  const pathname = usePathname();
  const locale = useLocale();
  const [task, setTask] = useState<string>(() => taskFor(pathname));
  const [kind, setKind] = useState<string>("confusing");
  const [ease, setEase] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [errors, setErrors] = useState<{ ease?: string; message?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      task, kind, ease, message, name: name || undefined, team: team || undefined,
      page: pathname, locale, device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop", viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
    const parsed = feedbackSchema.safeParse(payload);
    if (!parsed.success) {
      const bad = new Set(parsed.error.issues.map((i) => i.path[0]));
      setErrors({ ease: bad.has("ease") ? "Pick how easy it was." : undefined, message: bad.has("message") ? "Please tell us a little more." : undefined });
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data satisfies FeedbackInput) });
      setStatus(res.ok ? "done" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col gap-4" role="status">
        <h2 className="type-title">Thanks, that really helps</h2>
        <p className="type-body text-text-secondary">Your feedback was saved. We use it to decide what to fix first. You can add more if you ran into anything else.</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/feedback" onClick={closeFeedbackDialog}>See all feedback</LinkButton>
          <Button variant="secondary" onClick={closeFeedbackDialog}>Back to the site</Button>
          <Button variant="secondary" onClick={() => { setMessage(""); setEase(0); setStatus("idle"); }}>Add more feedback</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="type-title">Tell us how it went</h2>
        <p className="type-body-sm mt-1 text-text-secondary">Thanks for testing TuTuStay. This is a prototype, so nothing here is a real booking. Honest feedback helps us most, including the small things. What you write is visible to everyone testing, on the <LocalLink href="/feedback" onClick={closeFeedbackDialog} className="text-text-link underline">feedback page</LocalLink>.</p>
      </div>

      <Field label="Which part of TuTuStay were you using?" hint="We picked this from the page you are on. Change it if it is wrong.">
        {({ id, describedBy }) => (
          <Select id={id} value={task} onChange={(e) => setTask(e.target.value)} aria-describedby={describedBy}>
            {FEEDBACK_TASKS.map((k) => <option key={k} value={k}>{TASKS[k]}</option>)}
          </Select>
        )}
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="type-label mb-2">How easy was it to do what you wanted? <span aria-hidden className="text-error-text">*</span></legend>
        <div className="grid grid-cols-5 gap-2">
          {EASE.map((label, i) => (
            <label key={label} className="cursor-pointer">
              <input type="radio" name="ease" value={i + 1} checked={ease === i + 1} onChange={() => setEase(i + 1)} className="peer sr-only" />
              <span className="flex min-h-14 flex-col items-center justify-center rounded-control border border-border-control px-1 text-center peer-checked:border-action-primary peer-checked:bg-action-primary peer-checked:text-text-on-action peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-focus">
                <span className="type-label">{i + 1}</span>
                <span className="type-body-sm hidden sm:block">{label}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="type-body-sm flex justify-between text-text-secondary sm:hidden"><span>1 {EASE[0]}</span><span>5 {EASE[4]}</span></p>
        {errors.ease ? <p role="alert" className="type-body-sm text-error-text">{errors.ease}</p> : null}
      </fieldset>

      <fieldset>
        <legend className="type-label mb-2">What best describes it?</legend>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_KINDS.map((k) => <Chip key={k} name="kind" value={k} checked={kind === k} onChange={() => setKind(k)}>{KINDS[k]}</Chip>)}
        </div>
      </fieldset>

      <Field label="What happened?" hint="What did you try, what did you expect, and what got in the way?" required error={errors.message}>
        {({ id, describedBy, invalid }) => <Textarea id={id} rows={4} placeholder="For example: I could not find where to enter my coupon."  maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} aria-describedby={describedBy} invalid={invalid} />}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name (optional)" hint="So we can ask a follow-up question.">{({ id }) => <Input id={id} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />}</Field>
        <Field label="Your team (optional)">
          {({ id }) => (
            <Select id={id} value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="">Prefer not to say</option>
              {FEEDBACK_TEAMS.map((k) => <option key={k} value={k}>{TEAMS[k]}</option>)}
            </Select>
          )}
        </Field>
      </div>

      {status === "failed" ? <p role="alert" className="type-body-sm rounded-control bg-error-bg p-3 text-error-text">Could not save your feedback. Please try again.</p> : null}
      <Button type="submit" size="lg" fullWidth loading={status === "sending"}>Send feedback</Button>
    </form>
  );
}

/** A pill-shaped radio option, styled like the product's other chips. */
function Chip({ name, value, checked, onChange, children }: { name: string; value: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="type-body-sm inline-flex min-h-11 items-center rounded-full border border-border-control px-4 hover:bg-surface-subtle peer-checked:border-action-primary peer-checked:bg-surface-brand-subtle peer-checked:font-medium peer-checked:text-text-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-focus">{children}</span>
    </label>
  );
}

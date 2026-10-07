"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { addDays, formatDate } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";

/* ISO `YYYY-MM-DD` helpers. Calendar dates only, no timezones (see domain/dates.ts). */
const pad = (n: number) => String(n).padStart(2, "0");
const mk = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`; // m is 0-based
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return { y: y!, m: m! - 1, d: d! }; };
const monthStart = (s: string) => `${s.slice(0, 8)}01`;
const addMonths = (s: string, n: number) => { const { y, m } = parse(s); const t = y * 12 + m + n; return mk(Math.floor(t / 12), ((t % 12) + 12) % 12, 1); };
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const weekday = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d)).getUTCDay(); // 0 = Sunday

interface Props {
  id: string;
  /** Visible field label, also used to name the button and dialog. */
  label: string;
  /** `in` / `out` edit one end of a range (the calendar shows the whole range); `single` picks one date. */
  kind: "in" | "out" | "single";
  checkIn: string;
  checkOut: string;
  min: string;
  onPick: (range: { checkIn: string; checkOut: string }) => void;
  /** Which edge of the field the calendar hangs from (use `right` for fields near the right edge of the page). */
  align?: "left" | "right";
  className?: string;
}

/** A date field that opens an Airbnb-style calendar: two months side by side (one on phones), range band, keyboard support. */
export function DateField({ id, label, kind, checkIn, checkOut, min, onPick, align = "left", className }: Props) {
  const t = useT();
  const locale = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"in" | "out">(kind === "out" ? "out" : "in");
  const [hover, setHover] = useState<string | null>(null);
  const value = kind === "out" ? checkOut : checkIn;
  const [view, setView] = useState(monthStart(value || min));
  const [focusDate, setFocusDate] = useState(value || min);
  const [shift, setShift] = useState(0);
  const kbd = useRef(false);
  // Open on mouse-down: the search bar widens as soon as a field is pressed, so by mouse-up the field has moved and the click would be lost.
  const downHandled = useRef(false);

  const names = useMemo(() => {
    const month = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
    const day = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    const wk = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
    return {
      month: (s: string) => month.format(new Date(`${s}T00:00:00Z`)),
      day: (s: string) => day.format(new Date(`${s}T00:00:00Z`)),
      week: Array.from({ length: 7 }, (_, i) => wk.format(new Date(Date.UTC(2023, 0, 1 + i)))), // 2023-01-01 is a Sunday
    };
  }, [locale]);

  function show() {
    setStep(kind === "out" ? "out" : "in");
    setView(monthStart(value || min));
    setFocusDate(value || min);
    setHover(null);
    kbd.current = true;
    setOpen(true);
  }
  function close(returnFocus = true) { setOpen(false); if (returnFocus) trigger.current?.focus(); }

  // Keep the panel inside the viewport: measure once it is laid out and nudge it sideways if needed.
  useLayoutEffect(() => {
    if (!open || !panel.current) return;
    panel.current.style.marginLeft = "0px"; // measure unshifted
    const r = panel.current.getBoundingClientRect();
    const over = r.right - (window.innerWidth - 16);
    setShift(over > 0 ? -over : r.left < 16 ? 16 - r.left : 0);
  }, [open, view]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  // Move DOM focus to the focused day after keyboard navigation (and when the calendar opens).
  useEffect(() => {
    if (!open || !kbd.current) return;
    panel.current?.querySelector<HTMLButtonElement>(`button[data-d="${focusDate}"]`)?.focus();
    kbd.current = false;
  }, [open, focusDate, view]);

  function choose(d: string) {
    if (d < min) return;
    if (kind === "single") { onPick({ checkIn: d, checkOut: addDays(d, 1) }); close(); return; }
    if (step === "out" && d > checkIn) { onPick({ checkIn, checkOut: d }); close(); return; }
    onPick({ checkIn: d, checkOut: addDays(d, 1) });
    setStep("out");
    setFocusDate(d);
  }

  function go(next: string) {
    const d = next < min ? min : next;
    kbd.current = true;
    setFocusDate(d);
    const visible = window.innerWidth < 640 ? 1 : 2; // phones show one month
    if (d < view) setView(monthStart(d));
    else if (monthStart(d) > addMonths(view, visible - 1)) setView(addMonths(monthStart(d), -(visible - 1)));
  }

  function onKey(e: React.KeyboardEvent) {
    const map: Record<string, () => string> = {
      ArrowLeft: () => addDays(focusDate, -1), ArrowRight: () => addDays(focusDate, 1),
      ArrowUp: () => addDays(focusDate, -7), ArrowDown: () => addDays(focusDate, 7),
      Home: () => addDays(focusDate, -weekday(parse(focusDate).y, parse(focusDate).m, parse(focusDate).d)),
      End: () => addDays(focusDate, 6 - weekday(parse(focusDate).y, parse(focusDate).m, parse(focusDate).d)),
      PageUp: () => addMonths(focusDate, -1).slice(0, 8) + pad(Math.min(parse(focusDate).d, daysIn(parse(addMonths(focusDate, -1)).y, parse(addMonths(focusDate, -1)).m))),
      PageDown: () => addMonths(focusDate, 1).slice(0, 8) + pad(Math.min(parse(focusDate).d, daysIn(parse(addMonths(focusDate, 1)).y, parse(addMonths(focusDate, 1)).m))),
    };
    if (e.key === "Escape") { e.stopPropagation(); close(); return; }
    const fn = map[e.key];
    if (fn) { e.preventDefault(); go(fn()); }
  }

  const rangeEnd = step === "out" && hover && hover > checkIn ? hover : checkOut;
  const canPrev = view > monthStart(min);

  // Called as a function, not used as <Month/>: a component defined here would remount (and eat clicks) on every hover.
  const renderMonth = (start: string, cls?: string) => {
    const { y, m } = parse(start);
    const lead = weekday(y, m, 1);
    const n = daysIn(y, m);
    const cells: (string | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: n }, (_, i) => mk(y, m, i + 1))];
    while (cells.length % 7) cells.push(null);
    const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
    return (
      <div key={start} className={cls}>
        <p className="type-label mb-4 text-center font-semibold" aria-live="polite">{names.month(start)}</p>
        <table role="grid" aria-label={names.month(start)} className="border-collapse">
          <thead>
            <tr>{names.week.map((w, i) => <th key={i} scope="col" className="type-caption pb-2 text-center font-normal text-text-secondary">{w}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((d, ci) => {
                  if (!d) return <td key={ci} />;
                  const past = d < min;
                  const isIn = d === checkIn && kind !== "single";
                  const isOut = d === checkOut && kind !== "single";
                  const selected = kind === "single" ? d === checkIn : isIn || isOut;
                  const inBand = kind !== "single" && d > checkIn && d < rangeEnd;
                  const bandEdge = kind !== "single" && ((isIn && rangeEnd > checkIn) || (d === rangeEnd && rangeEnd > checkIn && d !== checkIn));
                  const band: CSSProperties | undefined = bandEdge
                    ? { background: `linear-gradient(to ${isIn ? "right" : "left"}, transparent 50%, var(--surface-brand-subtle) 50%)` }
                    : undefined;
                  const state = [
                    isIn ? t("date.isCheckIn") : isOut ? t("date.isCheckOut") : inBand ? t("date.inStay") : "",
                    past ? t("date.past") : "",
                  ].filter(Boolean).join(". ");
                  return (
                    <td key={ci} className={`p-0 ${inBand ? "bg-surface-brand-subtle" : ""}`} style={band}>
                      <button
                        type="button"
                        data-d={d}
                        tabIndex={d === focusDate ? 0 : -1}
                        aria-disabled={past || undefined}
                        aria-pressed={selected}
                        aria-current={d === min ? "date" : undefined}
                        aria-label={`${names.day(d)}${state ? `. ${state}` : ""}`}
                        onClick={() => choose(d)}
                        onMouseEnter={() => setHover(d)}
                        onFocus={() => setFocusDate(d)}
                        className={`press mx-auto flex size-11 items-center justify-center rounded-full border text-sm sm:size-12 ${
                          selected ? "border-action-primary bg-action-primary font-semibold text-text-on-action"
                          : past ? "cursor-not-allowed border-transparent text-text-disabled"
                          : "border-transparent font-medium text-text-primary hover:border-action-primary hover:bg-surface-brand-subtle"
                        } ${d === min && !selected ? "text-text-brand underline underline-offset-4" : ""}`}
                      >
                        {parse(d).d}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const arrow = "absolute top-[3.2rem] inline-flex size-8 items-center justify-center rounded-full text-text-brand hover:bg-surface-brand-subtle disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div ref={root} className={`relative ${className ?? ""}`}>
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${value ? formatDate(value, false, locale) : t("date.choose")}`}
        onPointerDown={(e) => { if (e.pointerType !== "mouse" || e.button !== 0) return; e.preventDefault(); downHandled.current = true; if (open) close(false); else show(); }}
        onClick={() => { if (downHandled.current) { downHandled.current = false; return; } if (open) close(false); else show(); }}
        className="date-trigger type-body flex min-h-11 w-full items-center justify-between gap-2 rounded-field border border-border-control bg-surface-raised px-3 text-left"
      >
        <span className={value ? "" : "text-text-muted"}>{value ? formatDate(value, true, locale) + (value.slice(0, 4) !== min.slice(0, 4) ? ` ${value.slice(0, 4)}` : "") : t("date.choose")}</span>
        <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" /></svg>
      </button>

      {open ? (
        <div
          ref={panel}
          role="dialog"
          aria-label={label}
          onKeyDown={onKey}
          style={{ marginLeft: shift }}
          className={`anim-drop absolute ${align === "right" ? "right-0" : "left-0"} top-full z-40 mt-3 w-[min(calc(100vw-2rem),23rem)] rounded-card border border-border-subtle bg-surface-raised p-6 shadow-high sm:w-max sm:max-w-[calc(100vw-2rem)]`}
        >
          <p className="type-body-sm mb-3 pr-10 text-text-secondary" aria-live="polite">{kind === "single" ? "" : step === "out" ? t("date.pickOut") : t("date.pickIn")}</p>
          <button type="button" aria-label={t("date.prevMonth")} disabled={!canPrev} onClick={() => setView(addMonths(view, -1))} className={`${arrow} left-4`}>
            <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
          </button>
          <button type="button" aria-label={t("date.nextMonth")} onClick={() => setView(addMonths(view, 1))} className={`${arrow} right-4`}>
            <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
          </button>
          <div className="flex gap-8" onMouseLeave={() => setHover(null)}>
            {renderMonth(view)}
            {renderMonth(addMonths(view, 1), "hidden sm:block")}
          </div>
        </div>
      ) : null}
    </div>
  );
}

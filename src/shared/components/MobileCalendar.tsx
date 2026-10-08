"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, formatDate, nightsBetween } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * A phone-sized calendar: a pinned header with the weekday row and what is picked so far, then 13 months stacked and scrolling.
 * It opens on the month of the chosen check-in, skips the weeks that are already over, and shades the nights between check-in and check-out.
 * Overnight stays pick a range (check-in, then check-out); session and daycation pick one date.
 * The caller provides the scroll area (this renders only its content).
 */
export function MobileCalendar({ checkIn, checkOut, overnight, today, onChange }: {
  checkIn: string; checkOut: string; overnight: boolean; today: string;
  onChange: (range: { checkIn: string; checkOut: string }) => void;
}) {
  const t = useT();
  const locale = useLocale();
  const [stage, setStage] = useState<"in" | "out">("in");
  const root = useRef<HTMLDivElement>(null);

  const months = useMemo(() => {
    const [y, m] = today.split("-").map(Number) as [number, number];
    const month = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
    return Array.from({ length: 13 }, (_, i) => {
      const t0 = y * 12 + (m - 1) + i;
      const yy = Math.floor(t0 / 12), mm = t0 % 12;
      const lead = new Date(Date.UTC(yy, mm, 1)).getUTCDay();
      const days = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
      // The current month starts at the week that holds today: the rows before it are over and only push everything down.
      const todayDay = i === 0 ? Number(today.slice(8, 10)) : 1;
      const skipWeeks = Math.floor((lead + todayDay - 1) / 7);
      return { key: `${yy}-${mm}`, id: `${yy}-${pad(mm + 1)}`, label: month.format(new Date(Date.UTC(yy, mm, 1))), lead, days, yy, mm, skip: skipWeeks * 7 };
    });
  }, [today, locale]);
  const week = useMemo(() => { const f = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }); return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2023, 0, 1 + i)))); }, [locale]);

  // Open on the month of the chosen check-in, so a date far ahead is not hidden below the fold.
  useEffect(() => {
    const target = root.current?.querySelector<HTMLElement>(`[data-month="${checkIn.slice(0, 7)}"]`);
    if (target && checkIn.slice(0, 7) !== today.slice(0, 7)) target.scrollIntoView({ block: "start" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(d: string) {
    if (d < today) return;
    if (!overnight) { onChange({ checkIn: d, checkOut: addDays(d, 1) }); return; }
    if (stage === "out" && d > checkIn) { onChange({ checkIn, checkOut: d }); setStage("in"); return; }
    onChange({ checkIn: d, checkOut: addDays(d, 1) });
    setStage("out");
  }

  const nights = overnight ? Math.max(1, nightsBetween(checkIn, checkOut)) : 0;
  const summary = !overnight
    ? formatDate(checkIn, false, locale)
    : stage === "out"
      ? `${formatDate(checkIn, true, locale)} → ?`
      : `${formatDate(checkIn, true, locale)} → ${formatDate(checkOut, true, locale)} · ${t(nights === 1 ? "sheet.nightOne" : "sheet.nightMany", { n: nights })}`;

  return (
    <div ref={root}>
      <div className="sticky top-0 z-20 border-b border-border-subtle bg-surface-raised">
        <div className="grid grid-cols-7 px-3 pt-2 text-center type-body-sm text-text-secondary">
          {week.map((w, i) => <span key={i}>{w}</span>)}
        </div>
        <p role="status" className="type-label px-5 pb-2 pt-1">
          <span className="text-text-secondary">{overnight ? t(stage === "in" ? "sheet.pickIn" : "sheet.pickOut") : t("sheet.pickDay")}</span>
          <span className="block">{summary}</span>
        </p>
      </div>
      {months.map((mo) => {
        const cells = [...Array.from({ length: mo.lead }, () => null as number | null), ...Array.from({ length: mo.days }, (_, i) => i + 1)].slice(mo.skip);
        return (
          <section key={mo.key} aria-label={mo.label} data-month={mo.id} className="scroll-mt-28 px-3 pb-4 pt-3">
            <h3 className="type-label px-2 pb-2">{mo.label}</h3>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, k) => {
                if (day === null) return <span key={`b${k}`} />;
                const d = iso(mo.yy, mo.mm, day);
                const past = d < today;
                const start = d === checkIn, end = overnight && d === checkOut;
                const between = overnight && d > checkIn && d < checkOut;
                const hasRange = overnight && checkOut > checkIn;
                return (
                  <div key={d} className="relative flex justify-center">
                    {between ? <span aria-hidden className="absolute inset-y-0 inset-x-0 bg-surface-brand-subtle" /> : null}
                    {start && hasRange ? <span aria-hidden className="absolute inset-y-0 left-1/2 right-0 bg-surface-brand-subtle" /> : null}
                    {end && hasRange ? <span aria-hidden className="absolute inset-y-0 left-0 right-1/2 bg-surface-brand-subtle" /> : null}
                    <button
                      type="button" disabled={past} onClick={() => pick(d)} aria-pressed={start || end}
                      aria-label={`${formatDate(d, false, locale)}${start ? ` (${t("sheet.checkInDay")})` : end ? ` (${t("sheet.checkOutDay")})` : ""}`}
                      className={`type-label relative z-10 flex size-11 items-center justify-center rounded-full ${past ? "text-text-disabled" : start || end ? "bg-action-primary text-text-on-action" : d === today ? "border border-text-primary hover:bg-surface-subtle" : "hover:bg-surface-subtle"}`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

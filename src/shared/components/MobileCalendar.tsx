"use client";

import { useMemo, useState } from "react";
import { addDays } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * A phone-sized calendar: weekday header pinned on top, then 13 months stacked and scrolling.
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

  const months = useMemo(() => {
    const [y, m] = today.split("-").map(Number) as [number, number];
    const month = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
    return Array.from({ length: 13 }, (_, i) => {
      const t0 = y * 12 + (m - 1) + i;
      const yy = Math.floor(t0 / 12), mm = t0 % 12;
      return { key: `${yy}-${mm}`, label: month.format(new Date(Date.UTC(yy, mm, 1))), lead: new Date(Date.UTC(yy, mm, 1)).getUTCDay(), days: new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate(), yy, mm };
    });
  }, [today, locale]);
  const week = useMemo(() => { const f = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }); return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2023, 0, 1 + i)))); }, [locale]);

  function pick(d: string) {
    if (d < today) return;
    if (!overnight) { onChange({ checkIn: d, checkOut: addDays(d, 1) }); return; }
    if (stage === "out" && d > checkIn) { onChange({ checkIn, checkOut: d }); setStage("in"); return; }
    onChange({ checkIn: d, checkOut: addDays(d, 1) });
    setStage("out");
  }

  return (
    <>
      <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-border-subtle bg-surface-raised px-3 py-2 text-center type-body-sm text-text-secondary">
        {week.map((w, i) => <span key={i}>{w}</span>)}
      </div>
      {overnight ? <p className="type-body-sm px-5 pt-3 text-text-secondary">{stage === "in" ? t("sheet.pickIn") : t("sheet.pickOut")}</p> : null}
      {months.map((mo) => (
        <section key={mo.key} aria-label={mo.label} className="px-3 pb-4 pt-3">
          <h3 className="type-label px-2 pb-2">{mo.label}</h3>
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: mo.lead }, (_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: mo.days }, (_, i) => {
              const d = iso(mo.yy, mo.mm, i + 1);
              const past = d < today;
              const start = d === checkIn, end = overnight && d === checkOut;
              const between = overnight && d > checkIn && d < checkOut;
              return (
                <button
                  key={d} type="button" disabled={past} onClick={() => pick(d)} aria-pressed={start || end}
                  className={`type-label flex size-11 items-center justify-center justify-self-center rounded-full ${past ? "text-text-disabled" : start || end ? "bg-action-primary text-text-on-action" : between ? "rounded-none bg-surface-brand-subtle" : "hover:bg-surface-subtle"} ${between ? "w-full" : ""}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

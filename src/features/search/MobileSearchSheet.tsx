"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { addDays, formatDate, LIMITS, type SessionHours, type StayType } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { dataLabel } from "@/i18n/dataLabels";
import type { GuestState } from "@/shared/components/GuestPicker";
import { guestSummaryText } from "@/shared/lib/guestSummary";
import { MobileCalendar } from "@/shared/components/MobileCalendar";
import { StayTypePicker } from "@/shared/components/StayTypePicker";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Field";
import { Stepper } from "@/shared/ui/Stepper";

export interface SheetValue { place: string; checkIn: string; checkOut: string; guests: GuestState }
type Panel = "where" | "when" | "who" | null;

interface Props {
  open: boolean;
  onClose: () => void;
  value: SheetValue;
  onChange: (v: SheetValue) => void;
  /** Overnight, session or daycation (and session length). */
  stay: { stayType: StayType; sessionHours: SessionHours };
  onStay: (v: { stayType: StayType; sessionHours: SessionHours }) => void;
  /** Runs the search. Returns false (and the sheet stays open) when the dates are not valid. */
  onSubmit: () => boolean;
  overnight: boolean;
  today: string;
  placeOptions: string[];
  error?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const PIN = <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-text-brand" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6.500-5.600-6.500-11a6.500 6.500 0 0 1 13 0C18.500 15.400 12 21 12 21Z" /><circle cx="12" cy="10" r="2.300" /></svg>;
const CHEVRON = <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>;

function Sub({ title, onBack, children, footer }: { title: string; onBack: () => void; children: ReactNode; footer?: ReactNode }) {
  const t = useT();
  return (
    <div className="sheet-right absolute inset-0 z-10 flex flex-col bg-surface-raised">
      <div className="flex items-center gap-2 px-3 pt-3">
        <button type="button" aria-label={t("common.back")} onClick={onBack} className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
          <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>
      </div>
      <h2 className="type-heading px-5 pb-3 pt-1">{title}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer ? <div className="border-t border-border-subtle px-5 py-3">{footer}</div> : null}
    </div>
  );
}

/**
 * The phone search: a full-screen drawer with Where / When / Who. Each row opens its own panel that slides in from the right
 * (destination list, a scrolling calendar, guests), and Search at the bottom runs the search. Wide screens use the search bar instead.
 */
export function MobileSearchSheet({ open, onClose, value, onChange, stay, onStay, onSubmit, overnight, today, placeOptions, error }: Props) {
  const t = useT();
  const locale = useLocale();
  const ref = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); setPanel(null); }
    if (!open && d.open) d.close();
  }, [open]);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    return placeOptions.filter((p) => !s || p.toLowerCase().includes(s) || dataLabel(locale, p).toLowerCase().includes(s));
  }, [q, placeOptions, locale]);

  const dates = `${formatDate(value.checkIn, true, locale)}${overnight ? ` – ${formatDate(value.checkOut, true, locale)}` : ""}`;
  const who = guestSummaryText(t, value.guests.adults + value.guests.children, value.guests.rooms);
  const row = (label: string, text: string, p: Exclude<Panel, null>) => (
    <button type="button" onClick={() => { setPanel(p); if (p === "where") setQ(""); }} className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 rounded-field border border-border-control bg-surface-raised px-4 py-3 text-left transition-colors hover:bg-surface-subtle">
      <span className="min-w-0"><span className="type-body-sm block text-text-secondary">{label}</span><span className="type-label block truncate">{text}</span></span>
      {CHEVRON}
    </button>
  );

  return (
    <dialog
      ref={ref} aria-label={t("search.label")} onClose={onClose}
      className="sheet-right m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-surface-raised p-0 text-text-primary backdrop:bg-black/40 lg:hidden"
    >
      {open ? (
        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-2 px-3 pt-3">
            <button type="button" aria-label={t("common.close")} onClick={onClose} className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
              <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <h2 className="type-heading px-5 pb-4 pt-1">{t("search.label")}</h2>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5">
            <StayTypePicker stayType={stay.stayType} sessionHours={stay.sessionHours} onChange={onStay} />
            {row(t("search.where"), value.place ? dataLabel(locale, value.place) : t("search.anywhere"), "where")}
            {row(t("sheet.when"), dates, "when")}
            {row(t("search.guests"), who, "who")}
            {error ? <p role="alert" className="type-body-sm text-error-text">{error}</p> : null}
          </div>
          <div className="border-t border-border-subtle px-5 py-3">
            <Button size="lg" fullWidth onClick={() => { if (onSubmit()) onClose(); }}>{t("search.submit")}</Button>
          </div>

          {panel === "where" ? (
            <Sub title={t("sheet.find")} onBack={() => setPanel(null)}>
              <div className="px-5">
                <div className="relative">
                  <input
                    autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.wherePlaceholder")} aria-label={t("search.where")}
                    className="min-h-12 w-full rounded-field border border-border-control bg-surface-raised pl-4 pr-12 type-body focus:border-border-focus"
                  />
                  {q ? <button type="button" aria-label={t("common.clear")} onClick={() => setQ("")} className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface-subtle"><svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg></button> : null}
                </div>
                <ul className="mt-2">
                  {[{ v: "", l: t("search.anywhere") }, ...matches.map((p) => ({ v: p, l: dataLabel(locale, p) }))].map((o) => (
                    <li key={o.v || "any"} className="border-b border-border-subtle">
                      <button type="button" onClick={() => { onChange({ ...value, place: o.v }); setPanel(null); }} className="flex min-h-14 w-full cursor-pointer items-center gap-4 text-left">
                        {PIN}<span className="type-body">{o.l}</span>
                      </button>
                    </li>
                  ))}
                  {q.trim() && !matches.some((p) => p.toLowerCase() === q.trim().toLowerCase()) ? (
                    <li><button type="button" onClick={() => { onChange({ ...value, place: q.trim() }); setPanel(null); }} className="flex min-h-14 w-full cursor-pointer items-center gap-4 text-left">{PIN}<span className="type-body">{q.trim()}</span></button></li>
                  ) : null}
                </ul>
              </div>
            </Sub>
          ) : null}

          {panel === "when" ? (
            <Sub
              title={t("sheet.when")} onBack={() => setPanel(null)}
              footer={
                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => { onChange({ ...value, checkIn: today, checkOut: addDays(today, 1) }); }} className="type-label min-h-11 cursor-pointer px-1 text-text-link underline underline-offset-4">{t("sheet.clearDates")}</button>
                  <Button size="lg" onClick={() => setPanel(null)}>{t("sheet.apply")}</Button>
                </div>
              }
            >
              <MobileCalendar checkIn={value.checkIn} checkOut={value.checkOut} overnight={overnight} today={today} onChange={(r) => onChange({ ...value, ...r })} />
            </Sub>
          ) : null}

          {panel === "who" ? (
            <Sub title={t("search.guests")} onBack={() => setPanel(null)} footer={<Button size="lg" fullWidth onClick={() => setPanel(null)}>{t("sheet.apply")}</Button>}>
              <div className="flex flex-col gap-5 px-5 pt-2">
                <Stepper label={t("guests.adults")} value={value.guests.adults} min={LIMITS.adults.min} max={LIMITS.adults.max} onChange={(adults) => onChange({ ...value, guests: { ...value.guests, adults } })} />
                <Stepper label={t("guests.children")} value={value.guests.children} min={LIMITS.children.min} max={LIMITS.children.max} onChange={(children) => onChange({ ...value, guests: { ...value.guests, children } })} />
                <Stepper label={t("guests.rooms")} value={value.guests.rooms} min={LIMITS.rooms.min} max={LIMITS.rooms.max} onChange={(rooms) => onChange({ ...value, guests: { ...value.guests, rooms } })} />
                <Checkbox
                  label={<>{t("guests.foreigner")}<span className="type-body-sm block text-text-secondary">{t("guests.foreignerHint")}</span></>}
                  checked={value.guests.foreigner}
                  onChange={(e) => onChange({ ...value, guests: { ...value.guests, foreigner: e.target.checked } })}
                />
              </div>
            </Sub>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

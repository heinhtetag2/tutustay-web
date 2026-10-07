"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { addDays, formatDate, isValidStayRange, LIMITS, type SessionHours, type StayType } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { LocalLink } from "@/shared/components/LocalLink";
import { MobileCalendar } from "@/shared/components/MobileCalendar";
import { StayTypePicker } from "@/shared/components/StayTypePicker";
import { guestSummaryText } from "@/shared/lib/guestSummary";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Field";
import { Price } from "@/shared/ui/Price";
import { Stepper } from "@/shared/ui/Stepper";
import { toQueryString, type SearchParams } from "@/validation/search";

interface Props {
  params: SearchParams;
  today: string;
  offered: StayType[];
  fromRate: number | null;
  soldOut?: boolean;
  sessionHours?: readonly number[];
  /** On the stay page: where "Reserve" goes (the rooms screen). */
  reserveHref?: string;
}

/**
 * Phones: the price and your dates stay pinned at the bottom. Tapping them opens a bottom sheet where the stay type, dates,
 * guests and rate type are changed (the same URL the room list reads), and "See rooms" jumps to the rooms.
 */
export function StayBookingBar({ params, today, offered, fromRate, soldOut, sessionHours, reserveHref }: Props) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState(false);
  const [error, setError] = useState<string>();
  // The calendar works on a local copy so quick taps never read stale dates while the URL catches up.
  const [picked, setPicked] = useState({ checkIn: params.checkIn, checkOut: params.checkOut });
  useEffect(() => { setPicked({ checkIn: params.checkIn, checkOut: params.checkOut }); }, [params.checkIn, params.checkOut]);
  const overnight = params.stayType === "overnight";
  const unit = overnight ? t("price.perNight") : t("price.perStay");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); setDates(false); setError(undefined); }
    if (!open && d.open) d.close();
  }, [open]);

  const apply = (patch: Partial<SearchParams>) => {
    const next = { ...params, ...patch };
    const out = next.stayType === "overnight" ? next.checkOut : addDays(next.checkIn, 1);
    if (!isValidStayRange(next.checkIn, out, today)) { setError(t(next.checkIn < today ? "err.pastDate" : "err.dateRange")); return; }
    setError(undefined);
    router.replace(`${pathname}?${toQueryString({ ...next, checkOut: out })}`, { scroll: false });
  };

  const range = `${formatDate(params.checkIn, true, locale)}${overnight ? ` – ${formatDate(params.checkOut, true, locale)}` : ""}`;
  const who = guestSummaryText(t, params.adults + params.children, params.rooms);
  const price = fromRate !== null
    ? <Price amount={fromRate} prefix={t("price.from")} unit={unit} />
    : <span className="type-label">{soldOut ? t("stay.soldOut") : t("booking.noRates")}</span>;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border-subtle bg-surface-raised px-[var(--gutter)] py-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="min-w-0 cursor-pointer text-left">
          {price}
          <span className="type-body-sm block truncate text-text-secondary underline underline-offset-4">{range} · {who}</span>
        </button>
        {reserveHref
          ? <LocalLink href={reserveHref} className="type-label inline-flex min-h-11 shrink-0 items-center rounded-control bg-action-cta px-5 text-text-on-action">{t("booking.reserve")}</LocalLink>
          : <a href="#rooms" className="type-label inline-flex min-h-11 shrink-0 items-center rounded-control bg-action-cta px-5 text-text-on-action">{t("booking.seeRooms")}</a>}
      </div>

      <dialog
        ref={ref} aria-label={t("booking.card")} onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
        className="sheet-up fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-sheet bg-surface-raised p-0 text-text-primary shadow-high backdrop:bg-black/50 lg:hidden"
      >
        {open ? (
          <div className="relative flex max-h-[92dvh] flex-col">
            <div className="flex items-center justify-between px-5 pt-4">
              <h2 className="type-heading">{dates ? t("sheet.when") : t("booking.yourStay")}</h2>
              <button type="button" aria-label={t("common.close")} onClick={() => (dates ? setDates(false) : setOpen(false))} className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
                <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>

            {dates ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto"><MobileCalendar checkIn={picked.checkIn} checkOut={picked.checkOut} overnight={overnight} today={today} onChange={(r) => { setPicked(r); apply(r); }} /></div>
                <div className="border-t border-border-subtle px-5 py-3">
                  {error ? <p role="alert" className="type-body-sm mb-2 text-error-text">{error}</p> : null}
                  <Button size="lg" fullWidth onClick={() => setDates(false)}>{t("sheet.apply")}</Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4 pt-2">
                  <div>
                    {fromRate !== null ? <Price amount={fromRate} unit={unit} size="lg" prefix={t("price.from")} /> : <p className="type-subheading">{soldOut ? t("stay.soldOut") : t("booking.noRates")}</p>}
                    <p className="type-body-sm mt-1 text-text-secondary">{params.foreigner ? t("price.foreignerRate") : t("price.localRate")}</p>
                  </div>

                  <StayTypePicker stayType={params.stayType} sessionHours={params.sessionHours} offered={offered} hours={sessionHours} onChange={(s: { stayType: StayType; sessionHours: SessionHours }) => apply(s)} />

                  <div className="flex items-center justify-between gap-3 border-y border-border-subtle py-4">
                    <div className="min-w-0">
                      <p className="type-label">{overnight ? t("sheet.when") : t("search.date")}</p>
                      <p className="type-body-sm text-text-secondary">{formatDate(params.checkIn, false, locale)}{overnight ? ` → ${formatDate(params.checkOut, false, locale)}` : ""}</p>
                    </div>
                    <button type="button" onClick={() => setDates(true)} className="type-label min-h-11 shrink-0 cursor-pointer rounded-control bg-surface-subtle px-4 hover:bg-border-subtle">{t("booking.change")}</button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Stepper label={t("guests.adults")} value={params.adults} min={LIMITS.adults.min} max={LIMITS.adults.max} onChange={(adults) => apply({ adults })} />
                    <Stepper label={t("guests.children")} value={params.children} min={LIMITS.children.min} max={LIMITS.children.max} onChange={(children) => apply({ children })} />
                    <Stepper label={t("guests.rooms")} value={params.rooms} min={LIMITS.rooms.min} max={LIMITS.rooms.max} onChange={(rooms) => apply({ rooms })} />
                  </div>
                  <Checkbox
                    label={<>{t("guests.foreignerCard")}<span className="type-body-sm block text-text-secondary">{t("guests.foreignerHint")}</span></>}
                    checked={params.foreigner} onChange={(e) => apply({ foreigner: e.target.checked })}
                  />
                  {error ? <p role="alert" className="type-body-sm text-error-text">{error}</p> : null}
                </div>
                <div className="border-t border-border-subtle px-5 py-3">
                  {reserveHref
                    ? <LocalLink href={reserveHref} className="type-label inline-flex min-h-12 w-full items-center justify-center rounded-full bg-action-cta px-6 text-text-on-action">{t("booking.reserve")}</LocalLink>
                    : <Button size="lg" fullWidth onClick={() => { setOpen(false); setTimeout(() => document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" }), 50); }}>{t("booking.seeRooms")}</Button>}
                  <p className="type-body-sm mt-2 text-center text-text-secondary">{t("booking.nothingChargedYet")}</p>
                </div>
              </>
            )}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

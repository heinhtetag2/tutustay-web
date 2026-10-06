"use client";

import { usePathname, useRouter } from "next/navigation";
import { addDays, formatDate, isValidStayRange, nightsBetween, type SessionHours, type StayType } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { GuestPicker, type GuestState } from "@/shared/components/GuestPicker";
import { StayTypePicker } from "@/shared/components/StayTypePicker";
import { DateField } from "@/shared/components/DateField";
import { Checkbox, Field } from "@/shared/ui/Field";
import { Price } from "@/shared/ui/Price";
import { toQueryString, type SearchParams } from "@/validation/search";
import { useState } from "react";

interface Props {
  params: SearchParams;
  today: string;
  offered: StayType[];
  /** Lowest available rate for the current selection, or null. */
  fromRate: number | null;
  soldOut?: boolean;
  sessionHours?: readonly number[];
}

/**
 * Sticky booking card (desktop right column). It edits the same URL the room list reads,
 * so the selection survives refresh, sharing and the sign-in gate.
 */
export function BookingCard({ params, today, offered, fromRate, soldOut, sessionHours }: Props) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string>();
  const overnight = params.stayType === "overnight";

  const apply = (patch: Partial<SearchParams>) => {
    const next = { ...params, ...patch };
    const out = next.stayType === "overnight" ? next.checkOut : addDays(next.checkIn, 1);
    if (!isValidStayRange(next.checkIn, out, today)) {
      setError(t(next.checkIn < today ? "err.pastDate" : "err.dateRange"));
      return;
    }
    setError(undefined);
    const qs = toQueryString({ ...next, checkOut: out });
    router.replace(`${pathname}?${qs}`, { scroll: false });
  };

  const guests: GuestState = { adults: params.adults, children: params.children, rooms: params.rooms, foreigner: params.foreigner };
  const unit = overnight ? t("price.perNight") : t("price.perStay");

  return (
    <aside aria-label={t("booking.card")} className="flex flex-col gap-4 self-start rounded-field border border-border-subtle bg-surface-raised p-6 shadow-raised lg:sticky lg:top-6">
      <div>
        {fromRate !== null ? (
          <Price amount={fromRate} unit={unit} size="lg" prefix={t("price.from")} />
        ) : (
          <p className="type-subheading">{soldOut ? t("stay.soldOut") : t("booking.noRates")}</p>
        )}
        <p className="type-body-sm mt-1 text-text-secondary">{params.foreigner ? t("price.foreignerRate") : t("price.localRate")}</p>
      </div>

      <StayTypePicker
        stayType={params.stayType} sessionHours={params.sessionHours} offered={offered} hours={sessionHours}
        onChange={(s: { stayType: StayType; sessionHours: SessionHours }) => apply(s)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label={overnight ? t("search.checkIn") : t("search.date")} className={overnight ? "" : "col-span-2"}>
          {({ id }) => <DateField id={id} label={overnight ? t("search.checkIn") : t("search.date")} kind={overnight ? "in" : "single"} checkIn={params.checkIn} checkOut={params.checkOut} min={today} align="right" onPick={(r) => apply(r)} />}
        </Field>
        {overnight ? (
          <Field label={t("search.checkOut")}>
            {({ id }) => <DateField id={id} label={t("search.checkOut")} kind="out" checkIn={params.checkIn} checkOut={params.checkOut} min={today} align="right" onPick={(r) => apply(r)} />}
          </Field>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <span className="type-label">{t("search.guests")}</span>
        <GuestPicker value={guests} onChange={(g) => apply(g)} showForeigner={false} />
      </div>
      <Checkbox
        label={<>{t("guests.foreignerCard")}<span className="type-body-sm block text-text-secondary">{t("guests.foreignerHint")}</span></>}
        checked={params.foreigner}
        onChange={(e) => apply({ foreigner: e.target.checked })}
      />
      {error ? <p role="alert" className="type-body-sm text-error-text">{error}</p> : null}
      <p className="type-body-sm text-text-secondary">{t("booking.dates", { from: formatDate(params.checkIn, false, locale), to: overnight ? formatDate(params.checkOut, false, locale) : "—" })}</p>
      <a href="#rooms" className="type-label inline-flex min-h-12 items-center justify-center rounded-full bg-action-primary px-6 text-text-on-action hover:bg-action-primary-hover">
        {t("booking.seeRooms")}
      </a>
      <p className="type-body-sm text-center text-text-secondary">{t("booking.nothingChargedYet")}</p>
    </aside>
  );
}

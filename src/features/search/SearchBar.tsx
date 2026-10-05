"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { addDays, formatDate, isValidStayRange, type SessionHours, type StayType } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { GuestPicker, type GuestState } from "@/shared/components/GuestPicker";
import { Button } from "@/shared/ui/Button";
import { Field, Input } from "@/shared/ui/Field";
import { DateField } from "@/shared/components/DateField";
import { PlaceCombobox } from "./PlaceCombobox";
import { toQueryString, type SearchParams } from "@/validation/search";

interface Props {
  initial: Pick<SearchParams, "place" | "checkIn" | "checkOut" | "adults" | "children" | "rooms" | "stayType" | "sessionHours" | "foreigner">;
  today: string;
  placeOptions: string[];
  /** `hero`: always open. `summary`: a compact editable bar that opens on small screens. */
  variant?: "hero" | "summary";
  /** Extra params to preserve when searching again (category, filters). */
  preserve?: Partial<SearchParams>;
}

export function SearchBar({ initial, today, placeOptions, variant = "hero", preserve }: Props) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [place, setPlace] = useState(initial.place);
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [stay, setStay] = useState<{ stayType: StayType; sessionHours: SessionHours }>({
    stayType: initial.stayType,
    sessionHours: initial.sessionHours,
  });
  const [guests, setGuests] = useState<GuestState>({
    adults: initial.adults,
    children: initial.children,
    rooms: initial.rooms,
    foreigner: initial.foreigner,
  });
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState(variant === "hero");

  const overnight = stay.stayType === "overnight";
  const [nearState, setNearState] = useState<"idle" | "asking" | "denied" | "unavailable">("idle");

  // On the search page the stay type lives in the Filters panel and changes the URL: follow it.
  useEffect(() => {
    setStay({ stayType: initial.stayType, sessionHours: initial.sessionHours });
  }, [initial.stayType, String(initial.sessionHours)]); // eslint-disable-line react-hooks/exhaustive-deps

  function search(extra?: Partial<SearchParams>) {
    const out = overnight ? checkOut : addDays(checkIn, 1);
    if (!isValidStayRange(checkIn, out, today)) {
      setError(t(checkIn < today ? "err.pastDate" : "err.dateRange"));
      return false;
    }
    setError(undefined);
    const qs = toQueryString({ ...preserve, place: place.trim(), checkIn, checkOut: out, ...guests, ...stay, ...extra });
    router.push(`/${locale}/search${qs ? `?${qs}` : ""}`);
    return true;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    search();
  }

  /** "Nearby" (Location Service Policy): read once, only when chosen, never stored; denial leaves search working. */
  function askNearby() {
    if (!("geolocation" in navigator)) { setNearState("unavailable"); return; }
    setNearState("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setNearState("idle"); setPlace(""); search({ place: "", near: `${pos.coords.latitude.toFixed(3)},${pos.coords.longitude.toFixed(3)}` }); },
      () => setNearState("denied"),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }

  const summary = `${place || t("search.anywhere")} · ${formatDate(checkIn, true)}${
    overnight ? ` – ${formatDate(checkOut, true)}` : ""
  } · ${t(`stayType.${stay.stayType}`)}`;

  return (
    <form onSubmit={onSubmit} aria-label={t("search.label")} className={`rounded-card bg-surface-raised p-4 shadow-[0_2px_12px_#0000001a] md:p-6 ${variant === "summary" ? "border border-border-subtle shadow-none lg:border-0 lg:bg-transparent lg:p-0" : "lg:bg-transparent lg:p-0 lg:shadow-none"}`}>
      {variant === "summary" ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="type-label flex min-h-11 w-full items-center justify-between gap-3 text-left lg:hidden"
        >
          <span>{summary}</span>
          <span className="text-text-link">{open ? t("search.close") : t("search.edit")}</span>
        </button>
      ) : null}

      <div className={`${variant === "summary" && !open ? "hidden lg:block" : ""} ${variant === "summary" ? "mt-4 lg:mt-0" : ""}`}>
        <div className="search-pill grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] lg:items-center lg:gap-0 lg:rounded-full lg:border lg:border-border-subtle lg:bg-surface-raised lg:py-2 lg:pl-3 lg:pr-2 lg:shadow-[0_3px_12px_#0000001a] lg:hover:shadow-[0_6px_20px_#00000026] lg:transition-shadow
          lg:[&>*:not(:last-child)]:border-r lg:[&>*:not(:last-child)]:border-border-subtle lg:[&>*:not(:last-child)]:px-5 lg:[&>div]:gap-0.5
          lg:[&_label]:text-xs lg:[&_label]:font-semibold lg:[&_span.type-label]:text-xs lg:[&_span.type-label]:font-semibold
          lg:[&_input]:min-h-0 lg:[&_input]:border-0 lg:[&_input]:bg-transparent lg:[&_input]:p-0 lg:[&_input]:text-sm
          lg:[&_.date-trigger]:min-h-0 lg:[&_.date-trigger]:border-0 lg:[&_.date-trigger]:bg-transparent lg:[&_.date-trigger]:px-0 lg:[&_.date-trigger]:text-sm
          lg:[&_summary]:min-h-0 lg:[&_summary]:border-0 lg:[&_summary]:bg-transparent lg:[&_summary]:px-0 lg:[&_summary]:text-sm">
          <Field label={t("search.where")}>
            {({ id }) => (
              <PlaceCombobox id={id} value={place} onChange={setPlace} options={placeOptions} placeholder={t("search.wherePlaceholder")} nearby={{ active: Boolean(preserve?.near), state: nearState, onAsk: askNearby, onStop: () => search({ near: undefined }) }} />
            )}
          </Field>
          <Field label={overnight ? t("search.checkIn") : t("search.date")}>
            {({ id }) => <DateField id={id} label={overnight ? t("search.checkIn") : t("search.date")} kind={overnight ? "in" : "single"} checkIn={checkIn} checkOut={checkOut} min={today} onPick={(r) => { setCheckIn(r.checkIn); setCheckOut(r.checkOut); }} />}
          </Field>
          {overnight ? (
            <Field label={t("search.checkOut")}>
              {({ id }) => <DateField id={id} label={t("search.checkOut")} kind="out" checkIn={checkIn} checkOut={checkOut} min={today} onPick={(r) => { setCheckIn(r.checkIn); setCheckOut(r.checkOut); }} />}
            </Field>
          ) : (
            <div className="hidden lg:block" />
          )}
          <div className="flex flex-col gap-2">
            <span className="type-label">{t("search.guests")}</span>
            <GuestPicker value={guests} onChange={setGuests} />
          </div>
          <div className="lg:pl-2">
            <Button type="submit" size="lg" fullWidth className="group lg:rounded-full">
              <svg aria-hidden viewBox="0 0 24 24" className="size-0 -mr-2 shrink-0 opacity-0 transition-all duration-200 ease-out group-hover:mr-0 group-hover:size-5 group-hover:opacity-100 group-focus-visible:mr-0 group-focus-visible:size-5 group-focus-visible:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
              {t("search.submit")}
            </Button>
          </div>
        </div>


        {error ? (
          <p role="alert" className="type-body-sm mt-3 text-error-text">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { addDays, formatDate, isValidStayRange, type PropertyCategory, type SessionHours, type StayType } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { GuestPicker, type GuestState } from "@/shared/components/GuestPicker";
import { Button } from "@/shared/ui/Button";
import { Field, Input } from "@/shared/ui/Field";
import { DateField } from "@/shared/components/DateField";
import { PlaceCombobox } from "./PlaceCombobox";
import { MobileSearchSheet } from "./MobileSearchSheet";
import { PropertyTypeMenu } from "./PropertyTypeMenu";
import { StayTypeMenu } from "./StayTypeMenu";
import { toQueryString, type SearchParams } from "@/validation/search";

interface Props {
  initial: Pick<SearchParams, "place" | "checkIn" | "checkOut" | "adults" | "children" | "rooms" | "stayType" | "sessionHours" | "foreigner">;
  today: string;
  placeOptions: string[];
  /** `hero`: always open. `summary`: a compact editable bar that opens on small screens. */
  variant?: "hero" | "summary" | "header";
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
  // Only the home search picks a property type here; the other bars keep whatever type the results page already has.
  const [category, setCategory] = useState<PropertyCategory | undefined>();
  const [error, setError] = useState<string>();
  const [open] = useState(variant !== "summary");
  const [sheet, setSheet] = useState(false);
  // Top-bar search: while it is being used, the page below dims (the header stays bright), like a travel-site search.
  const [dim, setDim] = useState<number | null>(null);

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
    const qs = toQueryString({ ...preserve, ...(variant === "hero" ? { category } : {}), place: place.trim(), checkIn, checkOut: out, ...guests, ...stay, ...extra });
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

  const hd = variant === "header";
  // The top-bar and home searches share one look: an icon per part, the stay type as its own part, and the pill opens up on focus.
  const rich = variant === "header" || variant === "hero";
  // Each part has an icon. In the top bar it stays hidden until that part is in use (focused or open), like Fresha's search; on the home search it is always shown.
  const seg = (icon: ReactNode, node: ReactNode, cls = "") => rich ? (
    <div className={`group/seg flex items-center ${cls}`}>
      <span aria-hidden className={`mr-2.5 shrink-0 text-text-primary ${variant === "hero" ? "hidden lg:block" : "hidden xl:group-focus-within/seg:block xl:group-has-[details[open]]/seg:block xl:group-focus-within/pill:block xl:group-has-[details[open]]/pill:block"}`}>{icon}</span>
      <div className="min-w-0 flex-1">{node}</div>
    </div>
  ) : node;
  const ic = (d: ReactNode) => <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
  const PIN = ic(<><path d="M12 21s-6.500-5.600-6.500-11a6.500 6.500 0 0 1 13 0C18.500 15.400 12 21 12 21Z" /><circle cx="12" cy="10" r="2.300" /></>);
  const CAL = ic(<><rect x="4" y="5" width="16" height="15" rx="2.500" /><path d="M8 3v4M16 3v4M4 10h16" /></>);
  const BED = ic(<path d="M3 19v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 16h18M7 9V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />);
  const BLD = ic(<><path d="M5 21V4.500A1.500 1.500 0 0 1 6.500 3h11A1.500 1.500 0 0 1 19 4.500V21M3 21h18" /><path d="M9 7.500h1.500M13.500 7.500H15M9 11.500h1.500M13.500 11.500H15" /></>);
  const WHO = ic(<><circle cx="9" cy="8" r="3.500" /><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.500a3.500 3.500 0 0 1 0 7M18 20a6.500 6.500 0 0 0-3-5.500" /></>);

  const guestTotal = guests.adults + guests.children;
  const summaryPlace = place || t("search.anywhere");
  const summaryWhen = `${formatDate(checkIn, true, locale)}${overnight ? ` – ${formatDate(checkOut, true, locale)}` : ""} · ${guestTotal === 1 ? t("guests.guestOne") : t("guests.guestMany", { n: guestTotal })}`;

  return (
    <form
      onSubmit={onSubmit} aria-label={t("search.label")}
      onFocusCapture={variant === "header" ? (e) => setDim(e.currentTarget.closest("header")?.getBoundingClientRect().bottom ?? 0) : undefined}
      onBlurCapture={variant === "header" ? (e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDim(null); } : undefined}
      className={`relative rounded-card bg-surface-raised shadow-[0_2px_12px_#0000001a] ${variant === "summary" ? "lg:border-0 lg:bg-transparent lg:shadow-none" : variant === "header" ? "hidden lg:block lg:w-full lg:bg-transparent lg:shadow-none" : "p-4 md:p-6 lg:bg-transparent lg:p-0 lg:shadow-none"}`}>
      {variant === "summary" ? (
        <button
          type="button"
          aria-haspopup="dialog" aria-label={`${summaryPlace}, ${summaryWhen}`}
          onClick={() => setSheet(true)}
          className="type-label flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left lg:hidden"
        >
          <span className="min-w-0 truncate font-semibold">{summaryPlace}</span>
          <span className="type-body-sm shrink-0 text-text-secondary">
            {summaryWhen}
          </span>
        </button>
      ) : null}

      <div className={`${variant === "summary" && !open ? "hidden lg:block" : ""} ${variant === "summary" ? "px-4 pb-4 pt-1 lg:p-0" : ""}`}>
        <div className={`search-pill grid gap-4 ${variant === "header" ? "lg:mx-auto lg:w-[min(42rem,100%)] lg:focus-within:w-[min(72rem,100%)] lg:has-[details[open]]:w-[min(72rem,100%)] lg:grid-cols-[1.3fr_1fr_0.85fr_0.85fr_1.5fr_auto] lg:py-0.5 lg:pl-2 lg:pr-1.5" : variant === "hero" ? "lg:grid-cols-[1.35fr_0.95fr_1fr_0.8fr_0.8fr_1.3fr_auto] lg:py-2 lg:pl-3 lg:pr-2" : "lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] lg:py-2 lg:pl-3 lg:pr-2"} lg:items-center lg:gap-0 lg:rounded-full lg:border lg:border-border-subtle lg:bg-surface-raised lg:border-[#e5e5e5] lg:shadow-[0_2px_4px_#14141420] lg:hover:shadow-[0_4px_12px_#14141429]
          lg:[&>*:not(:last-child)]:relative lg:[&>*:not(:last-child)]:after:absolute lg:[&>*:not(:last-child)]:after:right-0 lg:[&>*:not(:last-child)]:after:top-1/2 lg:[&>*:not(:last-child)]:after:h-6 lg:[&>*:not(:last-child)]:after:w-px lg:[&>*:not(:last-child)]:after:-translate-y-1/2 lg:[&>*:not(:last-child)]:after:bg-border-subtle lg:[&>*:not(:last-child)]:px-4 lg:[&>div]:gap-0.5
          lg:[&_label]:text-xs lg:[&_label]:font-semibold lg:[&_span.type-label]:text-xs lg:[&_span.type-label]:font-semibold
          lg:[&_input]:min-h-0 lg:[&_input]:border-0 lg:[&_input]:bg-transparent lg:[&_input]:p-0 lg:[&_input]:text-sm! lg:[&_input]:font-medium! lg:[&_input]:leading-5! lg:[&_input]:text-text-primary
          lg:[&_.date-trigger]:min-h-0 lg:[&_.date-trigger]:border-0 lg:[&_.date-trigger]:bg-transparent lg:[&_.date-trigger]:px-0 lg:[&_.date-trigger]:text-sm! lg:[&_.date-trigger]:font-medium! lg:[&_.date-trigger]:leading-5!
          lg:[&_summary]:overflow-hidden lg:[&_summary]:min-h-0 lg:[&_summary]:border-0 lg:[&_summary]:bg-transparent lg:[&_summary]:px-0 lg:[&_summary]:text-sm! lg:[&_summary]:font-medium! lg:[&_summary]:leading-5! ${rich ? "lg:[&>*:nth-last-child(2)]:after:hidden lg:[&>*:focus-within]:after:hidden lg:[&>*:has(details[open])]:after:hidden group/pill origin-center lg:transition-[width,transform,background-color,box-shadow] lg:duration-[450ms] lg:ease-[cubic-bezier(0.32,0.72,0,1)] lg:focus-within:bg-surface-subtle lg:focus-within:shadow-[0_10px_30px_#00000033] lg:[&>*]:py-1 lg:[&>*>*>.flex-col]:gap-0 lg:[&_label]:leading-4 lg:[&>*]:transition-[min-height,padding,background-color,box-shadow] lg:[&>*]:duration-[450ms] lg:[&>*]:ease-[cubic-bezier(0.32,0.72,0,1)] lg:[&>*:not(:last-child):focus-within]:px-3 lg:[&:focus-within>*:not(:last-child)]:min-h-14 lg:[&:has(details[open])>*:not(:last-child)]:min-h-14 lg:[&>*:not(:last-child):focus-within]:rounded-full lg:[&>*:not(:last-child):has(details[open])]:rounded-full lg:[&>*:not(:last-child):focus-within]:border-transparent lg:[&>*:not(:last-child):has(details[open])]:border-transparent lg:[&>*:not(:last-child):focus-within]:bg-surface-raised lg:[&>*:not(:last-child):has(details[open])]:bg-surface-raised lg:[&>*:not(:last-child):focus-within]:shadow-[0_2px_12px_#0000002e] lg:[&>*:not(:last-child):has(details[open])]:shadow-[0_2px_12px_#0000002e] lg:[&_.date-trigger_svg]:hidden lg:[&_label]:whitespace-nowrap lg:[&_span.type-label]:whitespace-nowrap lg:[&_span.type-label]:truncate lg:[&>*]:min-w-0 lg:[&_summary]:whitespace-nowrap lg:[&_.date-trigger]:whitespace-nowrap lg:[&>*:not(:last-child)>div>div>:is(label,span.type-label)]:max-h-0 lg:[&>*:not(:last-child)>div>div>:is(label,span.type-label)]:overflow-hidden lg:[&>*:not(:last-child)>div>div>:is(label,span.type-label)]:opacity-0 lg:[&>*:not(:last-child)>div>div>:is(label,span.type-label)]:transition-[max-height,opacity] lg:[&>*:not(:last-child)>div>div>:is(label,span.type-label)]:duration-[450ms] lg:[&>*:not(:last-child)>div>div>:is(label,span.type-label)]:ease-[cubic-bezier(0.32,0.72,0,1)] lg:[&:focus-within>*:not(:last-child)>div>div>:is(label,span.type-label)]:max-h-5 lg:[&:focus-within>*:not(:last-child)>div>div>:is(label,span.type-label)]:opacity-100 lg:[&:has(details[open])>*:not(:last-child)>div>div>:is(label,span.type-label)]:max-h-5 lg:[&:has(details[open])>*:not(:last-child)>div>div>:is(label,span.type-label)]:opacity-100 lg:[&>*:not(:last-child):focus-within>div>div>:is(label,span.type-label)]:max-h-5 lg:[&>*:not(:last-child):focus-within>div>div>:is(label,span.type-label)]:opacity-100 lg:[&>*:not(:last-child):has(details[open])>div>div>:is(label,span.type-label)]:max-h-5 lg:[&>*:not(:last-child):has(details[open])>div>div>:is(label,span.type-label)]:opacity-100" : "lg:transition-shadow"}`}>
          {seg(PIN, <Field label={t("search.where")}>
            {({ id }) => (
              <PlaceCombobox id={id} value={place} onChange={setPlace} options={placeOptions} placeholder={t("search.wherePlaceholder")} nearby={{ active: Boolean(preserve?.near), state: nearState, onAsk: askNearby, onStop: () => search({ near: undefined }) }} />
            )}
          </Field>)}
          {rich ? seg(BED, <div className="flex flex-col gap-2"><span className="type-label">{t("stayType.label")}</span><StayTypeMenu value={stay} onChange={setStay} /></div>) : null}
          {variant === "hero" ? seg(BLD, <div className="flex flex-col gap-2"><span className="type-label">{t("filter.category")}</span><PropertyTypeMenu value={category} onChange={setCategory} /></div>) : null}
          {seg(CAL, <Field label={overnight ? t("search.checkIn") : t("search.date")}>
            {({ id }) => <DateField id={id} label={overnight ? t("search.checkIn") : t("search.date")} kind={overnight ? "in" : "single"} checkIn={checkIn} checkOut={checkOut} min={today} onPick={(r) => { setCheckIn(r.checkIn); setCheckOut(r.checkOut); }} />}
          </Field>, overnight ? "" : "lg:col-span-2")}
          {overnight ? (
            seg(CAL, <Field label={t("search.checkOut")}>
              {({ id }) => <DateField id={id} label={t("search.checkOut")} kind="out" checkIn={checkIn} checkOut={checkOut} min={today} onPick={(r) => { setCheckIn(r.checkIn); setCheckOut(r.checkOut); }} />}
            </Field>)
          ) : rich ? null : (
            <div className="hidden lg:block" />
          )}
          {seg(WHO, <div className="flex flex-col gap-2">
            <span className="type-label">{t("search.guests")}</span>
            <GuestPicker value={guests} onChange={setGuests} />
          </div>)}
          <div className="lg:pl-2">
            {variant === "header" ? (
              <button type="submit" aria-label={t("search.submit")} className="inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full bg-action-primary px-0 text-text-on-action transition-[height,min-width,padding,opacity] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-85 group-focus-within/pill:h-11 group-focus-within/pill:min-w-11 group-focus-within/pill:pl-4 group-focus-within/pill:pr-5 group-has-[details[open]]/pill:h-11 group-has-[details[open]]/pill:min-w-11">
                <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
                <span className="type-label max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-300 group-focus-within/pill:ml-2 group-focus-within/pill:max-w-24 group-focus-within/pill:opacity-100">{t("search.submit")}</span>
              </button>
            ) : (
            <Button type="submit" size="lg" fullWidth className="group lg:rounded-full">
              <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
              {t("search.submit")}
            </Button>
            )}
          </div>
        </div>


        {error ? (
          <p role="alert" className={variant === "header" ? "type-body-sm absolute left-4 top-full z-10 mt-2 rounded-field bg-error-bg px-3 py-1.5 text-error-text shadow-raised" : "type-body-sm mt-3 text-error-text"}>
            {error}
          </p>
        ) : null}
      </div>
      {variant === "summary" ? (
        <MobileSearchSheet
          open={sheet} onClose={() => setSheet(false)} overnight={overnight} today={today} placeOptions={placeOptions} error={error}
          value={{ place, checkIn, checkOut, guests }} stay={stay} onStay={setStay}
          onChange={(v) => { setPlace(v.place); setCheckIn(v.checkIn); setCheckOut(v.checkOut); setGuests(v.guests); }}
          onSubmit={() => search()}
        />
      ) : null}
      {variant === "header" && dim !== null ? (
        <div
          aria-hidden style={{ top: dim }}
          onPointerDown={(e) => { e.preventDefault(); (document.activeElement as HTMLElement | null)?.blur(); setDim(null); }}
          className="anim-backdrop fixed inset-x-0 bottom-0 -z-10 hidden bg-[#0000004d] lg:block"
        />
      ) : null}
    </form>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { PropertyCategory } from "@/domain";
import { dataLabel } from "@/i18n/dataLabels";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { Button } from "@/shared/ui/Button";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { Checkbox, Field, Input, Select } from "@/shared/ui/Field";
import { PriceRange } from "./PriceRange";
import { SORTS, toQueryString, type SearchParams } from "@/validation/search";

const CATEGORIES: PropertyCategory[] = ["hotel", "motel", "resort", "campsite"];
const FACILITIES = ["WiFi", "AC", "Swimming Pool", "Airport Shuttle", "24 Hour Front Desk", "Cafe", "Campfire Area"];
const ROOM_FACILITIES = ["AC", "WiFi", "Electric kettle", "Fan", "Daily Housekeeping"];
const BEDS = ["Single", "Double", "Twin", "Queen", "King"];
const RATING_BANDS = [4.5, 4, 3, 2] as const;

const CHIP_ICON = {
  sort: <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />,
  popular: <path d="M12 3c1 3.500 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 2.500 1.500 2.500C11 9 11 6 12 3Z" />,
  bookable: <><rect x="4" y="5" width="16" height="15" rx="2.500" /><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" /></>,
  coupons: <><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" /><path d="M14 6v12" strokeDasharray="2 2.500" /></>,
  refundable: <><path d="M4 12a8 8 0 1 0 2.500-5.800" /><path d="M4 4v4.500h4.500" /></>,
  more: <><path d="M3 7h9M18 7h3M3 17h3M12 17h9" /><circle cx="15" cy="7" r="2.500" /><circle cx="9" cy="17" r="2.500" /></>,
  clear: <path d="M6 6l12 12M18 6 6 18" />,
} as const;
const ChipIcon = ({ name }: { name: keyof typeof CHIP_ICON }) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{CHIP_ICON[name]}</svg>
);

/** Filters apply live (replace URL). On small screens they sit in a disclosure sheet. */
export function Filters({ params, sheetOnly = false, sidebar = false, inline = false, count }: { params: SearchParams; sheetOnly?: boolean; sidebar?: boolean; inline?: boolean; count?: number }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const morePanel = useRef<HTMLDivElement>(null);
  const [moreRight, setMoreRight] = useState(false);

  const apply = (patch: Partial<SearchParams>) => {
    const qs = toQueryString({ ...params, ...patch });
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const active =
    Number(Boolean(params.minRating)) + Number(params.refundable) +
    Number(params.popular) + Number(params.bookable) + Number(params.coupons) + params.beds.length + params.roomFacilities.length +
    params.facilities.length + Number(params.minPrice !== undefined || params.maxPrice !== undefined);

  const clearAll = () => apply({ category: undefined, minPrice: undefined, maxPrice: undefined, minRating: undefined, refundable: false, facilities: [], roomFacilities: [], beds: [], popular: false, bookable: false, coupons: false });

  const body = (
    <div className={sidebar ? "flex flex-col gap-5 [&>*]:border-b [&>*]:border-border-subtle [&>*]:pb-5 [&>*:last-child]:border-b-0" : "flex flex-col gap-6"}>
      {/* The stay type lives in the search bar and the property type menu above the results, not in this panel. */}
      {inline ? null : (<>
      <fieldset className="flex flex-col gap-3">
        <legend className="type-label mb-2">{t("filter.quick")}</legend>
        <Checkbox label={t("filter.popular")} checked={params.popular} onChange={(e) => apply({ popular: e.target.checked })} />
        <Checkbox label={t("filter.bookable")} checked={params.bookable} onChange={(e) => apply({ bookable: e.target.checked })} />
        <Checkbox label={t("filter.coupons")} checked={params.coupons} onChange={(e) => apply({ coupons: e.target.checked })} />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="type-label mb-2">{t("filter.price")}</legend>
        <PriceRange min={params.minPrice} max={params.maxPrice} onCommit={(a, b) => apply({ minPrice: a, maxPrice: b })} />
      </fieldset>

      </>)}

      <Field label={t("filter.rating")}>
        {({ id }) => (
          <Select id={id} value={params.minRating ?? ""} onChange={(e) => apply({ minRating: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">{t("filter.anyRating")}</option>
            {RATING_BANDS.map((b) => <option key={b} value={b}>{t("filter.ratingBand", { n: b, label: t(`rating.${b === 4.5 ? "fantastic" : b === 4 ? "excellent" : b === 3 ? "comfort" : "fair"}`) })}</option>)}
          </Select>
        )}
      </Field>

      {inline ? null : <Checkbox label={t("filter.refundable")} checked={params.refundable} onChange={(e) => apply({ refundable: e.target.checked })} />}

      <fieldset className="flex flex-col gap-3">
        <legend className="type-label mb-2">{t("filter.beds")}</legend>
        {BEDS.map((b) => (
          <Checkbox key={b} label={dataLabel(locale, b)} checked={params.beds.includes(b)} onChange={(e) => apply({ beds: e.target.checked ? [...params.beds, b] : params.beds.filter((x) => x !== b) })} />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-label mb-2">{t("filter.roomFacilities")}</legend>
        {ROOM_FACILITIES.map((f) => (
          <Checkbox key={f} label={dataLabel(locale, f)} checked={params.roomFacilities.includes(f)} onChange={(e) => apply({ roomFacilities: e.target.checked ? [...params.roomFacilities, f] : params.roomFacilities.filter((x) => x !== f) })} />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-label mb-2">{t("filter.facilities")}</legend>
        {FACILITIES.map((f) => (
          <Checkbox
            key={f} label={dataLabel(locale, f)} checked={params.facilities.includes(f)}
            onChange={(e) => apply({ facilities: e.target.checked ? [...params.facilities, f] : params.facilities.filter((x) => x !== f) })}
          />
        ))}
      </fieldset>

      {active > 0 && !sheetOnly ? (
        <Button variant="secondary" onClick={() => apply({ category: undefined, minPrice: undefined, maxPrice: undefined, minRating: undefined, refundable: false, facilities: [], roomFacilities: [], beds: [], popular: false, bookable: false, coupons: false })}>
          {t("filter.clear")}
        </Button>
      ) : null}
    </div>
  );

  // A slim row of always-visible controls floating over the map (no modal). Price and the rest live in a "More filters" dropdown.
  if (inline) {
    const pill = "type-body-sm inline-flex min-h-10 items-center gap-1.5 cursor-pointer whitespace-nowrap rounded-full border px-3.5 shadow-[0_2px_8px_#00000026] transition-colors";
    const chip = (on: boolean) => `${pill} ${on ? "border-border-focus bg-surface-brand-subtle font-semibold text-text-brand" : "border-border-control bg-surface-raised hover:bg-surface-subtle"}`;
    return (
      <div role="group" aria-label={t("filter.title")} className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-surface-raised pl-3.5 shadow-[0_2px_8px_#00000026]"><ChipIcon name="sort" /><SortSelect params={params} /></div>
        <PropertyTypeMenu value={params.category} onChange={(category) => apply({ category })} pillCls={pill} />
        <button type="button" aria-pressed={params.popular} onClick={() => apply({ popular: !params.popular })} className={chip(params.popular)}><ChipIcon name="popular" />{t("filter.popular")}</button>
        <button type="button" aria-pressed={params.bookable} onClick={() => apply({ bookable: !params.bookable })} className={chip(params.bookable)}><ChipIcon name="bookable" />{t("filter.bookable")}</button>
        <details
          className="group relative"
          onToggle={(e) => {
            // Keep the panel on screen: if opening to the right of the button would run past the window edge, open it to the left instead.
            if (!e.currentTarget.open) return;
            const r = e.currentTarget.getBoundingClientRect();
            setMoreRight(r.left + (morePanel.current?.offsetWidth ?? 320) > window.innerWidth - 16);
          }}
        >
          <summary className={`${chip(false)} flex list-none items-center gap-2 [&::-webkit-details-marker]:hidden`}>
            <ChipIcon name="more" />{t("filter.more")}{active ? ` (${active})` : ""}
            <svg aria-hidden viewBox="0 0 24 24" className="size-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <div ref={morePanel} className={`no-scrollbar absolute ${moreRight ? "right-0" : "left-0"} top-full z-20 mt-2 max-h-[min(34rem,calc(100dvh-14rem))] w-80 overflow-y-auto rounded-card border border-border-subtle bg-surface-raised p-5 shadow-[0_8px_32px_#00000040]`}>
            <fieldset className="mb-5 flex flex-col gap-2 border-b border-border-subtle pb-5">
              <legend className="type-label mb-2">{t("filter.price")}</legend>
              <PriceRange min={params.minPrice} max={params.maxPrice} onCommit={(a, b) => apply({ minPrice: a, maxPrice: b })} />
            </fieldset>
            <fieldset className="mb-5 flex flex-col gap-3 border-b border-border-subtle pb-5">
              <legend className="type-label mb-2">{t("filter.quick")}</legend>
              <Checkbox label={t("filter.coupons")} checked={params.coupons} onChange={(e) => apply({ coupons: e.target.checked })} />
              <Checkbox label={t("filter.refundable")} checked={params.refundable} onChange={(e) => apply({ refundable: e.target.checked })} />
            </fieldset>
            {body}
          </div>
        </details>
        {active > 0 ? <button type="button" onClick={clearAll} className={`${pill} inline-flex items-center gap-1.5 border-transparent bg-surface-raised text-text-link`}><ChipIcon name="clear" />{t("filter.clear")}</button> : null}
      </div>
    );
  }

  // Booking.com-style flat column for the full-screen map: heading, then sections divided by lines. Scrolls with its parent.
  if (sidebar) {
    return (
      <aside aria-label={t("filter.title")} className="p-4">
        <h2 className="type-subheading mb-4">{t("filter.by")}</h2>
        {body}
      </aside>
    );
  }

  if (sheetOnly) {
    // A centred modal (native <dialog>: focus trapped, Escape closes). Filters still apply live behind it.
    return (
      <>
        <button
          type="button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}
          className="type-label inline-flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-border-control bg-surface-raised px-4 sm:gap-2.5 sm:px-5 shadow-raised transition-colors hover:bg-surface-subtle"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 7h9M18 7h3M3 17h3M12 17h9" /><circle cx="15" cy="7" r="2.5" /><circle cx="9" cy="17" r="2.5" /></svg>
          {t("filter.titleSort")}{active ? ` (${active})` : ""}
        </button>
        <dialog
          ref={dialog} aria-label={t("filter.title")}
          onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
          className="m-auto max-h-[min(90dvh,52rem)] w-[min(94vw,40rem)] overflow-hidden rounded-sheet bg-surface-raised p-0 text-text-primary shadow-high backdrop:bg-black/50 open:flex open:flex-col"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-6 py-4">
            <h2 className="type-heading">{t("filter.titleSort")}</h2>
            <button type="button" aria-label={t("common.close")} onClick={() => dialog.current?.close()} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-subtle">
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <fieldset className="mb-6 border-b border-border-subtle pb-6">
              <legend className="type-label mb-3">{t("sort.label")}</legend>
              <div className="flex flex-wrap gap-2">
                {SORTS.map((o) => (
                  <button
                    key={o} type="button" aria-pressed={params.sort === o} onClick={() => apply({ sort: o })}
                    className={`type-body-sm min-h-11 rounded-full border px-4 ${params.sort === o ? "border-border-focus bg-surface-brand-subtle font-semibold text-text-brand" : "border-border-control hover:bg-surface-subtle"}`}
                  >
                    {t(`sort.${o}`)}
                  </button>
                ))}
              </div>
            </fieldset>
            {body}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-6 py-4">
            <button type="button" onClick={clearAll} disabled={active === 0} className="type-label min-h-11 px-1 text-text-link underline underline-offset-4 disabled:text-text-secondary disabled:no-underline">{t("filter.clear")}</button>
            <Button onClick={() => dialog.current?.close()}>{count === undefined ? t("common.close") : t("filter.view", { n: count })}</Button>
          </div>
        </dialog>
      </>
    );
  }

  return (
    <aside aria-label={t("filter.title")}>
      <div className={sheetOnly ? "" : "lg:hidden"}>
        <Button variant="secondary" aria-expanded={open} aria-controls="filters-panel" onClick={() => setOpen((o) => !o)}>
          {t("filter.title")}{active ? ` (${active})` : ""}
        </Button>
        {open ? <div id="filters-panel" className="mt-3 rounded-card border border-border-subtle bg-surface-raised p-4">{body}</div> : null}
      </div>
      {sheetOnly ? null : <div className="hidden rounded-card border border-border-subtle bg-surface-raised p-4 lg:block">
        <h2 className="type-subheading mb-4">{t("filter.title")}</h2>
        {body}
      </div>}
    </aside>
  );
}

export function SortSelect({ params }: { params: SearchParams }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <label className="flex items-center gap-2">
      <span className="type-body-sm whitespace-nowrap">{t("sort.label")}</span>
      <Select
        className="w-auto min-h-10! gap-2 rounded-full py-0! pl-3.5 pr-3 text-sm! leading-5! shadow-[0_2px_8px_#00000026]"
        value={params.sort}
        onChange={(e) => {
          const qs = toQueryString({ ...params, sort: e.target.value as SearchParams["sort"] });
          router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
        }}
      >
        {SORTS.map((s) => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
      </Select>
    </label>
  );
}



/** Property type as a small menu with an icon per option (the native select cannot show icons). */
function PropertyTypeMenu({ value, onChange, pillCls }: { value: PropertyCategory | undefined; onChange: (v: PropertyCategory | undefined) => void; pillCls: string }) {
  const t = useT();
  const root = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = () => { if (root.current) root.current.open = false; };
    const away = (e: Event) => { if (root.current?.open && !root.current.contains(e.target as Node)) close(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, []);
  const options: { key: PropertyCategory | undefined; label: string }[] = [
    { key: undefined, label: t("filter.allCategories") },
    ...CATEGORIES.map((c) => ({ key: c, label: t(`category.${c}`) })),
  ];
  const current = options.find((o) => o.key === value) ?? options[0]!;
  return (
    <details ref={root} className="group relative">
      <summary aria-label={t("filter.category")} className={`${pillCls} flex list-none items-center gap-2 border-border-control bg-surface-raised [&::-webkit-details-marker]:hidden`}>
        <CategoryIcon name={current.key ?? "all"} className="size-4" />
        {current.label}
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
      <ul role="listbox" aria-label={t("filter.category")} className="absolute left-0 top-full z-20 mt-2 w-64 rounded-card border border-border-subtle bg-surface-raised p-2 text-text-primary shadow-[0_8px_32px_#00000040]">
        {options.map((o) => {
          const on = o.key === value;
          return (
            <li key={o.key ?? "all"} role="option" aria-selected={on}>
              <button type="button" onClick={() => { onChange(o.key); if (root.current) root.current.open = false; }} className={`type-body-sm flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-control px-3 text-left ${on ? "bg-surface-brand-subtle font-semibold text-text-brand" : "hover:bg-surface-subtle"}`}>
                <span aria-hidden className={`flex size-8 shrink-0 items-center justify-center rounded-full ${on ? "bg-surface-raised" : "bg-surface-subtle"}`}><CategoryIcon name={o.key ?? "all"} className="size-4" /></span>
                <span className="flex-1">{o.label}</span>
                {on ? <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

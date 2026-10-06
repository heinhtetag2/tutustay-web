"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { PropertyCategory } from "@/domain";
import { dataLabel } from "@/i18n/dataLabels";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { Button } from "@/shared/ui/Button";
import { StayTypePicker } from "@/shared/components/StayTypePicker";
import { Checkbox, Field, Input, Select } from "@/shared/ui/Field";
import { PriceRange } from "./PriceRange";
import { SORTS, toQueryString, type SearchParams } from "@/validation/search";

const CATEGORIES: PropertyCategory[] = ["hotel", "motel", "resort", "campsite"];
const FACILITIES = ["WiFi", "AC", "Swimming Pool", "Airport Shuttle", "24 Hour Front Desk", "Cafe", "Campfire Area"];
const ROOM_FACILITIES = ["AC", "WiFi", "Electric kettle", "Fan", "Daily Housekeeping"];
const BEDS = ["Single", "Double", "Twin", "Queen", "King"];
const RATING_BANDS = [4.5, 4, 3, 2] as const;

/** Filters apply live (replace URL). On small screens they sit in a disclosure sheet. */
export function Filters({ params, sheetOnly = false, sidebar = false, count }: { params: SearchParams; sheetOnly?: boolean; sidebar?: boolean; count?: number }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const apply = (patch: Partial<SearchParams>) => {
    const qs = toQueryString({ ...params, ...patch });
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const active =
    Number(Boolean(params.category)) + Number(Boolean(params.minRating)) + Number(params.refundable) +
    Number(params.popular) + Number(params.bookable) + Number(params.coupons) + params.beds.length + params.roomFacilities.length +
    params.facilities.length + Number(params.minPrice !== undefined || params.maxPrice !== undefined);

  const clearAll = () => apply({ category: undefined, minPrice: undefined, maxPrice: undefined, minRating: undefined, refundable: false, facilities: [], roomFacilities: [], beds: [], popular: false, bookable: false, coupons: false });

  const body = (
    <div className={sidebar ? "flex flex-col gap-5 [&>*]:border-b [&>*]:border-border-subtle [&>*]:pb-5 [&>*:last-child]:border-b-0" : "flex flex-col gap-6"}>
      <StayTypePicker stayType={params.stayType} sessionHours={params.sessionHours} onChange={(s) => apply(s)} />

      <Field label={t("filter.category")}>
        {({ id }) => (
          <Select id={id} value={params.category ?? ""} onChange={(e) => apply({ category: (e.target.value || undefined) as PropertyCategory | undefined })}>
            <option value="">{t("filter.allCategories")}</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
          </Select>
        )}
      </Field>

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

      <Field label={t("filter.rating")}>
        {({ id }) => (
          <Select id={id} value={params.minRating ?? ""} onChange={(e) => apply({ minRating: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">{t("filter.anyRating")}</option>
            {RATING_BANDS.map((b) => <option key={b} value={b}>{t("filter.ratingBand", { n: b, label: t(`rating.${b === 4.5 ? "fantastic" : b === 4 ? "excellent" : b === 3 ? "comfort" : "fair"}`) })}</option>)}
          </Select>
        )}
      </Field>

      <Checkbox label={t("filter.refundable")} checked={params.refundable} onChange={(e) => apply({ refundable: e.target.checked })} />

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
      <span className="type-label whitespace-nowrap">{t("sort.label")}</span>
      <Select
        className="w-auto min-h-10 rounded-full pl-4 pr-9 text-sm"
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



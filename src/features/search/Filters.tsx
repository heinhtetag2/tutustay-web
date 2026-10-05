"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { PropertyCategory } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
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
export function Filters({ params, sheetOnly = false, sidebar = false }: { params: SearchParams; sheetOnly?: boolean; sidebar?: boolean }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const apply = (patch: Partial<SearchParams>) => {
    const qs = toQueryString({ ...params, ...patch });
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const active =
    Number(Boolean(params.category)) + Number(Boolean(params.minRating)) + Number(params.refundable) +
    Number(params.popular) + Number(params.bookable) + Number(params.coupons) + params.beds.length + params.roomFacilities.length +
    params.facilities.length + Number(params.minPrice !== undefined || params.maxPrice !== undefined);

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
          <Checkbox key={b} label={b} checked={params.beds.includes(b)} onChange={(e) => apply({ beds: e.target.checked ? [...params.beds, b] : params.beds.filter((x) => x !== b) })} />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-label mb-2">{t("filter.roomFacilities")}</legend>
        {ROOM_FACILITIES.map((f) => (
          <Checkbox key={f} label={f} checked={params.roomFacilities.includes(f)} onChange={(e) => apply({ roomFacilities: e.target.checked ? [...params.roomFacilities, f] : params.roomFacilities.filter((x) => x !== f) })} />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-label mb-2">{t("filter.facilities")}</legend>
        {FACILITIES.map((f) => (
          <Checkbox
            key={f} label={f} checked={params.facilities.includes(f)}
            onChange={(e) => apply({ facilities: e.target.checked ? [...params.facilities, f] : params.facilities.filter((x) => x !== f) })}
          />
        ))}
      </fieldset>

      {active > 0 ? (
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



"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { dataLabel } from "@/i18n/dataLabels";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { AmenityIcon } from "@/shared/ui/AmenityIcon";
import { Select } from "@/shared/ui/Field";
import { SORTS, toQueryString, type SearchParams } from "@/validation/search";

const BEDS = ["Single", "Double", "Twin", "Queen", "King"];
const ROOM_FACILITIES = ["AC", "WiFi", "Electric kettle", "Fan", "Daily Housekeeping"];
const ROOM_SORTS = SORTS.filter((s) => s === "recommended" || s === "price-asc" || s === "price-desc");

/** Filters for the rooms of one stay. They change the URL (like the search filters), so the list below re-renders from it. */
export function RoomFilters({ params }: { params: SearchParams }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [folded, setFolded] = useState(false);

  const apply = (patch: Partial<SearchParams>) => {
    const qs = toQueryString({ ...params, ...patch });
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const chip = (on: boolean) => `type-body-sm inline-flex min-h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 transition-[background-color,border-color,color,opacity] duration-200 ${on ? "border-text-primary bg-text-primary font-medium text-surface-raised hover:opacity-90" : "border-border-subtle bg-surface-raised font-medium hover:border-text-primary"}`;
  const active = params.beds.length + params.roomFacilities.length + Number(params.refundable);
  const row = "grid items-start gap-2 sm:grid-cols-[8rem_1fr] sm:gap-4";

  return (
    <div role="group" aria-label={t("filter.title")} className="sticky top-4 z-20 rounded-card border border-border-subtle bg-surface-raised shadow-[0_4px_16px_#0000001a]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 7h9M18 7h3M3 17h3M12 17h9" /><circle cx="15" cy="7" r="2.5" /><circle cx="9" cy="17" r="2.5" /></svg>
          <h2 className="type-label font-semibold">{t("filter.title")}{active ? ` (${active})` : ""}</h2>
          {active > 0 ? <button type="button" onClick={() => apply({ beds: [], roomFacilities: [], refundable: false })} className="type-body-sm ml-1 cursor-pointer text-text-link underline underline-offset-4">{t("filter.clear")}</button> : null}
        </div>
        <div className="flex items-center gap-2">
        <label className="flex items-center gap-2">
          <span className="type-body-sm whitespace-nowrap text-text-secondary">{t("sort.label")}</span>
          <Select className="w-auto min-h-9 gap-2 rounded-full pl-3.5 pr-3 text-sm" value={ROOM_SORTS.includes(params.sort as never) ? params.sort : "recommended"} onChange={(e) => apply({ sort: e.target.value as SearchParams["sort"] })}>
            {ROOM_SORTS.map((s) => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
          </Select>
        </label>
        <button type="button" aria-expanded={!folded} aria-label={t("filter.title")} onClick={() => setFolded((f) => !f)} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
          <svg aria-hidden viewBox="0 0 24 24" className={`size-4 transition-transform ${folded ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        </div>
      </div>

      <div className={`${folded ? "hidden" : "flex"} flex-col gap-3 border-t border-border-subtle px-4 py-4`}>
        <div className={row}>
          <span className="type-body-sm pt-1.5 text-text-secondary">{t("filter.beds")}</span>
          <div className="flex flex-wrap gap-2">
            {BEDS.map((b) => <button key={b} type="button" aria-pressed={params.beds.includes(b)} onClick={() => apply({ beds: toggle(params.beds, b) })} className={chip(params.beds.includes(b))}>{dataLabel(locale, b)}</button>)}
          </div>
        </div>
        <div className={row}>
          <span className="type-body-sm pt-1.5 text-text-secondary">{t("filter.roomFacilities")}</span>
          <div className="flex flex-wrap gap-2">
            {ROOM_FACILITIES.map((f) => (
              <button key={f} type="button" aria-pressed={params.roomFacilities.includes(f)} onClick={() => apply({ roomFacilities: toggle(params.roomFacilities, f) })} className={chip(params.roomFacilities.includes(f))}>
                <AmenityIcon name={f} className="size-4" />{dataLabel(locale, f)}
              </button>
            ))}
          </div>
        </div>
        <div className={row}>
          <span className="type-body-sm pt-1.5 text-text-secondary">{t("room.refundable")}</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={params.refundable} onClick={() => apply({ refundable: !params.refundable })} className={chip(params.refundable)}>{t("filter.refundable")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

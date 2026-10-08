"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { dataLabel } from "@/i18n/dataLabels";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { AmenityIcon } from "@/shared/ui/AmenityIcon";
import { Select } from "@/shared/ui/Field";
import { SORTS, toQueryString, type SearchParams } from "@/validation/search";

const BEDS = ["Single", "Double", "Twin", "Queen", "King"];
const ROOM_FACILITIES = ["AC", "WiFi", "Electric kettle", "Fan", "Daily Housekeeping"];
const ROOM_SORTS = SORTS.filter((s) => s === "recommended" || s === "price-asc" || s === "price-desc");

/** Filters for the rooms of one stay, as one slim row of pill dropdowns. They change the URL (like the search filters), so the list below re-renders from it. */
export function RoomFilters({ params }: { params: SearchParams }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<"beds" | "facilities" | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const apply = (patch: Partial<SearchParams>) => {
    const qs = toQueryString({ ...params, ...patch });
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const pill = (on: boolean) => `type-body-sm inline-flex min-h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 transition-colors ${on ? "border-text-primary bg-text-primary text-surface-raised" : "border-border-control bg-surface-raised hover:border-text-primary"}`;
  const active = params.beds.length + params.roomFacilities.length;
  const chev = <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;
  const menu = "absolute left-0 top-full z-30 mt-2 flex w-max max-w-[min(20rem,calc(100vw-2rem))] flex-col gap-1 rounded-card border border-border-subtle bg-surface-raised p-2 shadow-[0_8px_24px_#00000026]";
  const item = "type-body-sm flex min-h-10 cursor-pointer items-center gap-3 rounded-field px-3 hover:bg-surface-subtle";

  return (
    <div ref={root} role="group" aria-label={t("filter.title")} className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button type="button" aria-expanded={open === "beds"} aria-haspopup="true" onClick={() => setOpen(open === "beds" ? null : "beds")} className={pill(params.beds.length > 0)}>
          {t("filter.beds")}{params.beds.length ? ` (${params.beds.length})` : ""}{chev}
        </button>
        {open === "beds" ? (
          <div className={menu}>
            {BEDS.map((b) => (
              <label key={b} className={item}>
                <input type="checkbox" checked={params.beds.includes(b)} onChange={() => apply({ beds: toggle(params.beds, b) })} className="size-4 accent-[var(--color-action-cta)]" />{dataLabel(locale, b)}
              </label>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative">
        <button type="button" aria-expanded={open === "facilities"} aria-haspopup="true" onClick={() => setOpen(open === "facilities" ? null : "facilities")} className={pill(params.roomFacilities.length > 0)}>
          {t("filter.roomFacilities")}{params.roomFacilities.length ? ` (${params.roomFacilities.length})` : ""}{chev}
        </button>
        {open === "facilities" ? (
          <div className={menu}>
            {ROOM_FACILITIES.map((f) => (
              <label key={f} className={item}>
                <input type="checkbox" checked={params.roomFacilities.includes(f)} onChange={() => apply({ roomFacilities: toggle(params.roomFacilities, f) })} className="size-4 accent-[var(--color-action-cta)]" />
                <AmenityIcon name={f} className="size-4" />{dataLabel(locale, f)}
              </label>
            ))}
          </div>
        ) : null}
      </div>
      {active > 0 ? (
        <button type="button" aria-label={t("filter.clear")} title={t("filter.clear")} onClick={() => apply({ beds: [], roomFacilities: [], refundable: false })} className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-control bg-surface-raised hover:border-text-primary">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      ) : null}
      <label className="ml-auto flex items-center gap-2">
        <span className="type-body-sm whitespace-nowrap text-text-secondary">{t("sort.label")}</span>
        <Select className="w-auto min-h-10! gap-2 rounded-full py-0! pl-4 pr-3 text-sm! leading-5!" value={ROOM_SORTS.includes(params.sort as never) ? params.sort : "recommended"} onChange={(e) => apply({ sort: e.target.value as SearchParams["sort"] })}>
          {ROOM_SORTS.map((s) => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
        </Select>
      </label>
    </div>
  );
}

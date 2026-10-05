"use client";

import { useMemo } from "react";
import { formatKs } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { LocalLink } from "@/shared/components/LocalLink";
import type { StaySummary } from "@/services/stays.service";
import { StayMap, type MapPin } from "./StayMap";

/** The sidebar map card with "Show on map" (the Booking.com pattern). A small, non-interactive preview. */
export function MapCard({ items, mapQuery }: { items: StaySummary[]; mapQuery: string }) {
  const t = useT();
  const locale = useLocale();
  const pins: MapPin[] = useMemo(
    () => items.map((i) => ({ id: i.stay.id, name: i.stay.name, lat: i.stay.coords.lat, lng: i.stay.coords.lng, available: i.available, label: i.fromRate !== null ? formatKs(i.fromRate) : "", href: `/${locale}/stays/${i.stay.id}` })),
    [items, locale],
  );
  return (
    <div className="relative h-40 overflow-hidden rounded-card border border-border-subtle">
      <StayMap variant="mini" pins={pins} ariaLabel={t("map.miniAlt")} openLabel="" className="size-full" />
      <LocalLink href={`/search?${mapQuery}`} className="type-label absolute left-1/2 top-1/2 z-[500] inline-flex min-h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-control bg-action-primary px-4 text-text-on-action shadow-raised hover:bg-action-primary-hover">
        <span aria-hidden>⌖</span>{t("map.show")}
      </LocalLink>
    </div>
  );
}

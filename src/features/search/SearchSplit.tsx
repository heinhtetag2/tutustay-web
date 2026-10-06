"use client";

import { useMemo, useState } from "react";
import { formatKs } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { LocalLink } from "@/shared/components/LocalLink";
import type { StaySummary } from "@/services/stays.service";
import { EmptyState } from "@/shared/ui/States";
import { ResultCard } from "./ResultCard";
import { StayMap, type MapPin } from "./StayMap";

interface Props {
  items: StaySummary[];
  query: string;
  stayType: "overnight" | "session" | "daycation";
  foreigner: boolean;
  title: string;
  /** Filters button and sort, shown above the list. */
  controls: React.ReactNode;
  /** Shown when there are no results. */
  empty: { title: string; body: string; action?: React.ReactNode };
  /** Everything after `/search?` for the full-screen map (small screens). */
  mapQuery: string;
  /** The search bar, pinned under the header while the list scrolls. */
  searchBar: React.ReactNode;
  notice?: React.ReactNode;
  className?: string;
}

/**
 * Results beside a sticky map (the Plum Guide pattern): a horizontal list on the left, price pins on the right.
 * Hovering a card highlights its pin and the other way round. Small screens show the list with a "Map" button.
 */
export function SearchSplit({ items, query, stayType, foreigner, title, controls, empty, mapQuery, searchBar, notice, className }: Props) {
  const t = useT();
  const locale = useLocale();
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const pins: MapPin[] = useMemo(
    () => items.map((i) => ({
      id: i.stay.id, name: i.stay.name, lat: i.stay.coords.lat, lng: i.stay.coords.lng, available: i.available,
      label: i.available && i.fromRate !== null ? formatKs(i.fromRate) : t("stay.soldOutShort"),
      href: `/${locale}/stays/${i.stay.id}${query ? `?${query}` : ""}`,
    })),
    [items, query, locale, t],
  );

  function select(id: string | null) {
    setSelected(id);
    if (id) document.getElementById(`stay-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <div data-fullscreen-page className={`min-h-0 flex-1 flex-col ${className ?? "flex"}`}>
    <div className="relative z-30 shrink-0 border-b border-border-subtle bg-surface-brand-subtle px-4 py-3 sm:px-6 md:px-8">
      <div>{searchBar}</div>
      {notice}
    </div>
    <div className="grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section aria-label={t("search.results")} className="min-w-0 px-4 pb-24 sm:px-6 md:px-8 no-scrollbar lg:min-h-0 lg:overflow-y-auto lg:pb-8">
        <div className="mb-2 flex items-start justify-between gap-4 py-4">
          <div className="min-w-0 flex-1">
            <h1 className="type-subheading">{title}</h1>
            <p className="type-body-sm mt-1 text-text-secondary">{t("search.trust")}</p>
            <LocalLink href="/about" className="type-label mt-1 inline-block text-text-link underline underline-offset-4">{t("search.trustLink")}</LocalLink>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">{controls}</div>
        </div>
        {items.length === 0 ? (
          <EmptyState title={empty.title} body={empty.body} action={empty.action} />
        ) : (
          <ul className="flex flex-col divide-y divide-border-subtle border-t border-border-subtle">
            {items.map((item, i) => (
              <ResultCard
                key={item.stay.id} index={i} item={item} locale={locale} query={query} stayType={stayType} foreigner={foreigner} layout="split"
                selected={selected === item.stay.id} onHover={(on) => setHover(on ? item.stay.id : null)} onSelect={() => setSelected(item.stay.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <div className="relative hidden min-h-0 lg:block">
        <div className="isolate size-full overflow-hidden border-l border-border-subtle">
          <StayMap
            pins={pins} selectedId={selected} hoverId={hover} onSelect={select}
            ariaLabel={t("map.alt", { n: items.length })} openLabel={t("map.openStay")} failedLabel={t("map.tilesFailed")} clusterLabel={t("map.clusterWord")} zoomHint={t("map.zoomHint")} className="size-full"
          />
        </div>
      </div>

      <LocalLink
        href={`/search?${mapQuery}`}
        className="type-label fixed bottom-5 left-1/2 z-20 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-text-primary px-5 text-surface-raised shadow-high lg:hidden"
      >
        <span aria-hidden>⌖</span>{t("map.show")}
      </LocalLink>
    </div>
    </div>
  );
}

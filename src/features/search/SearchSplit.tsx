"use client";

import { useMemo, useState } from "react";
import { formatKs } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { ShowMapLink } from "./MapOverlayHost";
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
  /** Always-visible filters shown in the floating panel on wide screens (small screens use `controls`). */
  inlineFilters?: React.ReactNode;
  /** Phones: the swipeable quick-filter chips under the title. */
  chips?: React.ReactNode;
  /** Wide screens: the floating "Show list" pill over the map (a ViewToggle with its own position classes). */
  viewToggle?: React.ReactNode;
  notice?: React.ReactNode;
  className?: string;
}

/**
 * Results beside a sticky map (the Plum Guide pattern): a horizontal list on the left, price pins on the right.
 * Hovering a card highlights its pin and the other way round. Small screens show the list with a "Map" button.
 */
export function SearchSplit({ items, query, stayType, foreigner, title, controls, empty, mapQuery, searchBar, inlineFilters, chips, viewToggle, notice, className }: Props) {
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
    <div className="relative z-30 shrink-0 lg:hidden border-b border-border-subtle bg-surface-brand-subtle px-4 py-2 sm:px-6 md:px-8 lg:py-3">
      <div>{searchBar}</div>
      {notice}
    </div>
    <div className="grid lg:relative lg:min-h-0 lg:flex-1">
      <section aria-label={t("search.results")} className="min-w-0 px-4 pb-24 sm:px-6 md:px-8 no-scrollbar lg:absolute lg:bottom-4 lg:left-4 lg:top-4 lg:z-10 lg:w-[27rem] lg:overflow-y-auto lg:rounded-card lg:bg-surface-raised lg:px-5 lg:pb-4 lg:shadow-[0_8px_32px_#00000040]">
        <div className="mb-2 flex flex-col gap-3 py-4">
          {/* Same top as the list view: the count with "Filter & Sort" on its right, then the quick chips, then the short note. */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="type-subheading min-w-0">{title}</h1>
            <div className={`flex shrink-0 flex-wrap items-center justify-end gap-3 ${inlineFilters ? "lg:hidden" : ""}`}>{controls}</div>
          </div>
          {chips}
          <div className="min-w-0">
            <p className="type-body-sm text-text-secondary">{t("search.trust")}</p>
            <LocalLink href="/about" className="type-label mt-1 inline-block text-text-link underline underline-offset-4">{t("search.trustLink")}</LocalLink>
          </div>
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

      <div className="hidden lg:absolute lg:inset-0 lg:block">
        <div className="isolate size-full overflow-hidden">
          <StayMap
            pins={pins} selectedId={selected} hoverId={hover} onSelect={select}
            ariaLabel={t("map.alt", { n: items.length })} openLabel={t("map.openStay")} failedLabel={t("map.tilesFailed")} clusterLabel={t("map.clusterWord")} zoomHint={t("map.zoomHint")} className="size-full"
          />
        </div>
      </div>

      {viewToggle}

      {inlineFilters ? <div className="hidden lg:absolute lg:left-[28.5rem] lg:right-4 lg:top-4 lg:z-10 lg:block">{inlineFilters}</div> : null}

      <ShowMapLink
        href={`/${locale}/search?${mapQuery}`}
        className="type-label fixed bottom-5 left-1/2 z-20 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-text-primary px-5 text-surface-raised shadow-high transition-transform hover:scale-105 lg:hidden"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2Z" /><path d="M9 4v14M15 6v14" /></svg>
        {t("view.showMap")}
      </ShowMapLink>
    </div>
    </div>
  );
}

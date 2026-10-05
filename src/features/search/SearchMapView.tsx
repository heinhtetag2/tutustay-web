"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatKs } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { LocalLink } from "@/shared/components/LocalLink";
import type { StaySummary } from "@/services/stays.service";
import { EmptyState } from "@/shared/ui/States";
import { ResultCard } from "./ResultCard";
import { StayMap, type Bounds, type MapPin } from "./StayMap";

interface Props {
  items: StaySummary[];
  query: string;
  stayType: "overnight" | "session" | "daycation";
  foreigner: boolean;
  /** Everything after `/search?` for the "Close map" link (view reset to list). */
  closeQuery: string;
  boundsOn: boolean;
  /** Wide screens: the filter column. */
  sidebar: React.ReactNode;
  /** Smaller screens: the Filters button and panel. */
  sheet: React.ReactNode;
  /** Sort and "Stay near you". */
  controls: React.ReactNode;
  /** "Yangon · 5 Oct – 6 Oct · 2 guests", shown in the top bar. */
  summary: string;
}

/**
 * Full map mode (the Booking.com pattern): results list on the left, price pins on the right, "Close map" top right.
 * Selecting a pin highlights its card and the other way round. "Update results when map moves" searches the visible area.
 * Small screens show the list OR the map, with a toggle.
 */
export function SearchMapView({ items, query, stayType, foreigner, closeQuery, boundsOn, sidebar, sheet, controls, summary }: Props) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [pane, setPane] = useState<"list" | "map">("map");
  const [follow, setFollow] = useState(boundsOn);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  const pins: MapPin[] = useMemo(
    () => items.map((i) => ({
      id: i.stay.id, name: i.stay.name, lat: i.stay.coords.lat, lng: i.stay.coords.lng, available: i.available,
      label: i.available && i.fromRate !== null ? formatKs(i.fromRate) : t("stay.soldOutShort"),
      href: `/${locale}/stays/${i.stay.id}${query ? `?${query}` : ""}`,
    })),
    [items, query, locale, t],
  );

  function onBounds(b: Bounds) {
    if (!follow) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = new URLSearchParams(params.toString());
      q.set("bounds", [b.s, b.w, b.n, b.e].map((n) => n.toFixed(4)).join(","));
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    }, 600);
  }
  useEffect(() => () => clearTimeout(timer.current), []);

  // Closing plays a short exit animation first, then navigates. With reduced motion it is instant.
  const close = () => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(`/${locale}/search?${closeQuery}`); return; }
    setClosing(true);
    setTimeout(() => router.push(`/${locale}/search?${closeQuery}`), 210);
  };
  const onCloseClick = (e: React.MouseEvent) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); close(); };
  const closeRef = useRef(close);
  closeRef.current = close;

  // Full-screen mode: lock page scroll, make everything behind the overlay inert (so Tab and screen readers stay
  // inside the map view), and let Escape close it. All of it is undone when the map closes.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const inerted: Element[] = [];
    for (const child of Array.from(document.body.children)) {
      if (child.tagName === "SCRIPT" || child.contains(root.current) || child.hasAttribute("inert")) continue;
      child.setAttribute("inert", "");
      inerted.push(child);
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      inerted.forEach((c) => c.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggleFollow(on: boolean) {
    setFollow(on);
    if (!on && params.get("bounds")) {
      const q = new URLSearchParams(params.toString());
      q.delete("bounds");
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    }
  }

  function select(id: string | null) {
    setSelected(id);
    if (id) document.getElementById(`stay-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  const tab = (p: "list" | "map") => `type-label min-h-11 flex-1 px-4 ${pane === p ? "bg-surface-brand-subtle text-text-brand" : ""}`;

  return (
    <div ref={root} role="region" aria-label={t("map.fullscreen")} className={`fixed inset-0 z-[1000] flex flex-col bg-surface-page ${closing ? "anim-map-out" : "anim-map-in"}`}>
      {/* Small screens keep a slim bar so Close map is always reachable. On wide screens Close and the search-as-you-move control float over the map. */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-subtle bg-surface-raised px-3 py-2 lg:hidden">
        <LocalLink href={`/search?${closeQuery}`} onClick={onCloseClick} className="type-label inline-flex min-h-11 items-center gap-2 rounded-control border border-border-control px-4 hover:bg-surface-subtle">
          <span aria-hidden>←</span>{t("map.close")}
        </LocalLink>
        <p className="type-label min-w-0 flex-1 truncate">{summary}</p>
        <div className="flex w-full gap-0 overflow-hidden rounded-control border border-border-control" role="group" aria-label={t("view.label")}>
          <button type="button" aria-pressed={pane === "list"} className={tab("list")} onClick={() => setPane("list")}>{t("view.list")}</button>
          <button type="button" aria-pressed={pane === "map"} className={tab("map")} onClick={() => setPane("map")}>{t("view.mapPane")}</button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(22rem,30rem)_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(24rem,29rem)_minmax(0,1fr)]">
        <div className="anim-list-in hidden min-h-0 overflow-y-auto border-r border-border-subtle bg-surface-raised xl:block">{sidebar}</div>
        <section aria-label={t("search.results")} className={`${pane === "map" ? "hidden lg:flex" : "flex anim-pane"} anim-list-in min-h-0 flex-col overflow-y-auto border-border-subtle bg-surface-raised p-3 lg:border-r`}>
          <div className="mb-3 flex flex-col gap-3">
            <div><h1 className="type-subheading">{t(items.length === 1 ? "search.countOne" : "search.count", { n: items.length })}</h1><p className="type-body-sm hidden text-text-secondary lg:block">{summary}</p></div>
            <div className="flex flex-wrap items-start gap-3"><div className="xl:hidden">{sheet}</div>{controls}</div>
          </div>
          {items.length === 0 ? (
            <EmptyState title={t("search.empty.title")} body={t(boundsOn ? "map.empty.area" : "search.empty.filters")} />
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <ResultCard
                  key={item.stay.id} item={item} locale={locale} query={query} stayType={stayType} foreigner={foreigner}
                  selected={selected === item.stay.id} onHover={(on) => setHover(on ? item.stay.id : null)} onSelect={() => setSelected(item.stay.id)}
                />
              ))}
            </ul>
          )}
        </section>

        <div className={`${pane === "list" ? "hidden lg:block" : "block anim-pane"} anim-fade-in relative min-h-0`}>
          <StayMap
            pins={pins} selectedId={selected} hoverId={hover} onSelect={select} onBoundsChange={onBounds}
            ariaLabel={t("map.alt", { n: items.length })} openLabel={t("map.openStay")} failedLabel={t("map.tilesFailed")} clusterLabel={t("map.clusterWord")} zoomHint={t("map.zoomHint")} className="size-full"
          />
          <label className="type-body-sm absolute left-3 top-3 z-[500] flex min-h-11 items-center gap-2 rounded-control bg-surface-raised px-3 shadow-raised">
            <input type="checkbox" checked={follow} onChange={(e) => toggleFollow(e.target.checked)} className="size-5 accent-[var(--action-primary)]" />
            {t("map.update")}
          </label>
          <LocalLink href={`/search?${closeQuery}`} onClick={onCloseClick} className="type-label absolute right-3 top-3 z-[500] hidden min-h-11 items-center gap-2 rounded-control bg-surface-raised px-4 shadow-raised hover:bg-surface-subtle lg:inline-flex">
            {t("map.close")} <span aria-hidden>✕</span>
          </LocalLink>
          {items.length > 0 && selected === null ? <p className="type-body-sm pointer-events-none absolute bottom-3 left-3 z-[500] rounded-control bg-surface-raised px-3 py-2 shadow-raised">{t("map.hint")}</p> : null}
        </div>
      </div>
    </div>
  );
}

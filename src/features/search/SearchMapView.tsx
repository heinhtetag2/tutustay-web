"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { stayCover } from "@/features/stay-detail/photos";
import { PhotoTile } from "@/shared/ui/PhotoTile";
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
  /** The same summary split in two for the phone card: the place, then dates and guests. */
  summaryPlace: string;
  summaryWhen: string;
  /** The search summary shown at the top on phones; tapping it opens the search drawer. */
  searchBar: React.ReactNode;
}

/**
 * Full map mode (the Booking.com pattern): results list on the left, price pins on the right, "Close map" top right.
 * Selecting a pin highlights its card and the other way round. "Update results when map moves" searches the visible area.
 * Small screens show the list OR the map, with a toggle.
 */
export function SearchMapView({ items, query, stayType, foreigner, closeQuery, boundsOn, sidebar, sheet, controls, summary, searchBar }: Props) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [pane] = useState<"list" | "map">("map"); // phones always open on the map: "View list" returns to the results page
  const [follow, setFollow] = useState(boundsOn);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  // Phones show the chosen stay as a card at the bottom; wide screens keep the popup on the pin.
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const strip = useRef<HTMLUListElement>(null);
  const fromSwipe = useRef(false);
  const swipeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (selected === null || fromSwipe.current) { fromSwipe.current = false; return; }
    strip.current?.querySelector(`[data-stay="${selected}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected]);
  function onSwipe() {
    clearTimeout(swipeTimer.current);
    swipeTimer.current = setTimeout(() => {
      const el = strip.current;
      if (!el) return;
      const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
      let best: { id: string; d: number } | null = null;
      el.querySelectorAll<HTMLElement>("[data-stay]").forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (!best || d < best.d) best = { id: c.dataset.stay!, d };
      });
      const id = (best as { id: string } | null)?.id;
      if (id && id !== selected) { fromSwipe.current = true; setSelected(id); }
    }, 120);
  }
  useEffect(() => () => clearTimeout(swipeTimer.current), []);

  const pins: MapPin[] = useMemo(
    () => items.map((i) => ({
      id: i.stay.id, name: i.stay.name, lat: i.stay.coords.lat, lng: i.stay.coords.lng, available: i.available,
      label: i.available && i.fromRate !== null ? formatKs(i.fromRate) : t("stay.soldOutShort"),
      href: `/${locale}/stays/${i.stay.id}${query ? `?${query}` : ""}`,
    })),
    [items, query, locale, t],
  );

  const lastBounds = useRef<Bounds | null>(null);
  function applyBounds(b: Bounds) {
    const q = new URLSearchParams(params.toString());
    q.set("bounds", [b.s, b.w, b.n, b.e].map((n) => n.toFixed(4)).join(","));
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  }
  function searchThisArea() {
    setFollow(true);
    if (lastBounds.current) applyBounds(lastBounds.current);
  }

  function onBounds(b: Bounds) {
    lastBounds.current = b;
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
      <header className="flex flex-col gap-3 border-b border-border-subtle bg-surface-page px-3 pb-3 pt-3 lg:hidden">
        {searchBar}
        <div className="flex flex-wrap items-center gap-2">
          <LocalLink
            href={`/search?${closeQuery}`} onClick={onCloseClick}
            className="type-label inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-border-control bg-surface-raised px-4 shadow-raised transition-colors hover:bg-surface-subtle"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
            {t("map.viewList")}
          </LocalLink>
          <div className="xl:hidden">{sheet}</div>
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
            pins={pins} selectedId={selected} hoverId={hover} onSelect={select} onBoundsChange={onBounds} popup={wide}
            ariaLabel={t("map.alt", { n: items.length })} openLabel={t("map.openStay")} failedLabel={t("map.tilesFailed")} clusterLabel={t("map.clusterWord")} zoomHint={t("map.zoomHint")} className="size-full"
          />
          <label className="type-body-sm absolute left-3 top-3 z-[500] hidden min-h-11 lg:flex items-center gap-2 rounded-control bg-surface-raised px-3 shadow-raised">
            <input type="checkbox" checked={follow} onChange={(e) => toggleFollow(e.target.checked)} className="size-5 accent-[var(--action-primary)]" />
            {t("map.update")}
          </label>
          <LocalLink href={`/search?${closeQuery}`} onClick={onCloseClick} className="type-label absolute right-3 top-3 z-[500] hidden min-h-11 items-center gap-2 rounded-control bg-surface-raised px-4 shadow-raised hover:bg-surface-subtle lg:inline-flex">
            {t("map.close")} <span aria-hidden>✕</span>
          </LocalLink>
          {selected !== null ? (
            <ul
              ref={strip} onScroll={onSwipe} aria-label={t("search.results")}
              className="absolute inset-x-0 bottom-0 z-[500] flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 pt-2 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map(({ stay, fromRate, available }) => (
                <li key={stay.id} data-stay={stay.id} className="w-[85%] shrink-0 snap-center">
                  <LocalLink
                    href={`/stays/${stay.id}${query ? `?${query}` : ""}`}
                    className={`flex overflow-hidden rounded-card bg-surface-raised shadow-high ${selected === stay.id ? "ring-2 ring-action-primary" : ""}`}
                  >
                    <PhotoTile src={stayCover(stay.id)} alt="" tone={(stay.id.charCodeAt(stay.id.length - 1) * 37) % 360} className="size-28 shrink-0" />
                    <span className="flex min-w-0 flex-1 flex-col justify-between p-3">
                      <span>
                        <span className="type-subheading block truncate">{stay.name}</span>
                        <span className="type-body-sm block truncate text-text-secondary">{[stay.place.township, stay.place.city].filter(Boolean).join(", ")}</span>
                        {stay.rating ? <span className="type-body-sm mt-0.5 flex items-center gap-1"><span aria-hidden className="text-[#f59e0b]">★</span>{stay.rating.score.toFixed(1)}<span className="text-text-secondary">({stay.rating.count})</span></span> : null}
                      </span>
                      <span className="type-body-sm text-right">{available && fromRate !== null ? <><span className="type-price-sm">{formatKs(fromRate)}</span> <span className="text-text-secondary">{t(stayType === "overnight" ? "price.perNight" : "price.perStay")}</span></> : <span className="text-text-secondary">{t("stay.soldOutShort")}</span>}</span>
                    </span>
                  </LocalLink>
                </li>
              ))}
            </ul>
          ) : null}
          {!follow ? (
            <button type="button" onClick={searchThisArea} className="type-label absolute left-1/2 top-3 z-[500] inline-flex min-h-11 -translate-x-1/2 cursor-pointer items-center whitespace-nowrap rounded-full bg-surface-raised px-5 shadow-high hover:bg-surface-subtle lg:hidden">{t("map.searchArea")}</button>
          ) : null}
          {items.length > 0 && selected === null ? <p className="type-body-sm pointer-events-none absolute bottom-3 left-3 z-[500] rounded-control bg-surface-raised px-3 py-2 shadow-raised">{t("map.hint")}</p> : null}
        </div>
      </div>
    </div>
  );
}

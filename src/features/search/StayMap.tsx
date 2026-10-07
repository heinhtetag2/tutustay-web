"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";

export interface MapPin { id: string; name: string; lat: number; lng: number; label: string; available: boolean; href: string }
export interface Bounds { s: number; w: number; n: number; e: number }

interface Props {
  pins: MapPin[];
  selectedId?: string | null;
  hoverId?: string | null;
  onSelect?: (id: string | null) => void;
  onBoundsChange?: (b: Bounds) => void;
  /** `mini`: a non-interactive preview with dots (the sidebar card). `full`: price pins you can click. `location`: one stay, a round home pin, drag + zoom buttons (stay page). */
  variant?: "mini" | "full" | "location";
  ariaLabel: string;
  openLabel: string;
  /** Word after a count on a cluster pin ("3 stays") and the hint read with it. */
  /** Shown when no map picture can be loaded. */
  failedLabel?: string;
  /** Open a small popup over the selected pin. Turn off where a card elsewhere shows the stay instead (phones). Default on. */
  popup?: boolean;
  clusterLabel?: string;
  zoomHint?: string;
  className?: string;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Real map: Leaflet + OpenStreetMap tiles (no API key, fine for a prototype; pick a provider before launch).
 * Price pins are real <button>s so they work with a keyboard and a screen reader. The stay list beside the map is
 * the accessible equivalent of the map.
 */
export function StayMap({ pins, selectedId, hoverId, onSelect, onBoundsChange, variant = "full", ariaLabel, openLabel, clusterLabel = "stays", zoomHint = "zoom in", failedLabel, popup = true, className }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const lib = useRef<typeof import("leaflet") | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const fitted = useRef(0); // time of the last programmatic move, so we only report moves the user made
  const cb = useRef({ onSelect, onBoundsChange });
  cb.current = { onSelect, onBoundsChange };
  const active = useRef({ selectedId, hoverId });
  active.current = { selectedId, hoverId }; // read when pins are re-drawn, so a zoom never loses the highlight
  const mini = variant === "mini";
  const single = variant === "location";
  const [tilesFailed, setTilesFailed] = useState(false);
  const [ready, setReady] = useState(false); // the map fades in once its tiles have loaded

  const iconFor = (L: typeof import("leaflet"), p: MapPin, active: boolean) =>
    L.divIcon({
      className: "",
      iconSize: mini ? [14, 14] : single ? [0, 0] : undefined,
      iconAnchor: mini ? [7, 7] : [0, 0],
      html: single
        ? `<div aria-hidden="true" class="flex -translate-x-1/2 -translate-y-full flex-col items-center"><span class="mb-1.5 max-w-[15rem] truncate whitespace-nowrap rounded-full bg-surface-raised px-4 py-2 type-label shadow-raised">${esc(p.name)}</span><svg viewBox="0 0 40 52" class="h-12 w-10 text-action-primary drop-shadow-[0_3px_4px_#00000040]"><path d="M20 1C9.500 1 1 9.500 1 20c0 13 19 31 19 31s19-18 19-31C39 9.500 30.500 1 20 1Z" fill="currentColor" stroke="#fff" stroke-width="2"/><circle cx="20" cy="20" r="11" fill="#fff"/><path d="M20 12.500 12.500 19h2.200v7h4v-4.500h2.600V26h4v-7h2.200z" fill="currentColor"/></svg></div>`
        : mini
        ? `<span aria-hidden="true" class="block size-3.5 rounded-full border-2 border-white bg-action-primary shadow-raised"></span>`
        : `<button type="button" aria-label="${esc(p.name)}, ${esc(p.label)}" class="-translate-x-1/2 -translate-y-full whitespace-nowrap rounded-control border px-2 py-1 type-label shadow-raised transition-colors duration-150 ${
            active ? "border-action-primary bg-action-primary text-text-on-action" : p.available ? "border-border-control bg-surface-raised text-text-primary" : "border-border-subtle bg-surface-subtle text-text-secondary"
          }">${esc(p.label)}</button>`,
    });

  // Create the map once.
  useEffect(() => {
    let dead = false;
    let ro: ResizeObserver | undefined;
    (async () => {
      const L = await import("leaflet");
      if (dead || !el.current || map.current) return;
      lib.current = L;
      const m = L.map(el.current, {
        zoomControl: false, dragging: !mini, scrollWheelZoom: !mini && !single, doubleClickZoom: !mini, boxZoom: !mini, keyboard: !mini, touchZoom: !mini, attributionControl: true, // OpenStreetMap requires visible attribution, including on the small map
      }).setView([19.5, 96.0], 6);
      if (single) L.control.zoom({ position: "topright" }).addTo(m);
      else if (!mini) L.control.zoom({ position: "bottomright" }).addTo(m); // bottom right: top left is for our own controls
      // Tile sources, tried in order. If one can't load anything (blocked, rate-limited, offline) we move to the next,
      // and if none work we say so instead of leaving a silent blank map. Attribution is shown for whichever is active.
      const osm = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      // NEXT_PUBLIC_MAP_TILE_URL (+ NEXT_PUBLIC_MAP_ATTRIBUTION) lets you point at a keyed provider (MapTiler, Stadia, Mapbox…)
      // without code changes. OpenStreetMap is the key-free default for a prototype. NOTE: CARTO's public basemaps now
      // require an API key, so they are not used here.
      const custom = process.env.NEXT_PUBLIC_MAP_TILE_URL;
      const sources = [
        ...(custom ? [{ url: custom, opts: { maxZoom: 19, attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? osm } }] : []),
        { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", opts: { maxZoom: 18, attribution: osm } },
      ];
      let idx = 0, loaded = 0, errors = 0;
      let layer: import("leaflet").TileLayer | undefined;
      const useSource = () => {
        layer?.remove();
        errors = 0;
        const src = sources[idx]!;
        layer = L.tileLayer(src.url, { ...src.opts, referrerPolicy: "origin" }).addTo(m);
        layer.on("tileload", () => { loaded++; setReady(true); setTilesFailed(false); });
        layer.on("tileerror", () => { if (++errors >= 3 && loaded === 0) fallback(); });
      };
      const fallback = () => {
        if (loaded > 0 || dead) return;
        if (idx + 1 < sources.length) { idx++; useSource(); } else { setReady(true); setTilesFailed(true); }
      };
      useSource();
      setTimeout(fallback, 5000); // slow rather than erroring: don't wait forever
      setTimeout(() => setReady(true), 2500); // never stay blank-and-invisible
      m.on("moveend", () => {
        if (mini || Date.now() - fitted.current < 700) return;
        const b = m.getBounds();
        cb.current.onBoundsChange?.({ s: b.getSouth(), w: b.getWest(), n: b.getNorth(), e: b.getEast() });
      });
      m.on("click", () => cb.current.onSelect?.(null));
      map.current = m;
      // Keep Leaflet's idea of its size right when the pane is shown, hidden or resized (list/map toggle, window resize).
      ro = new ResizeObserver(() => m.invalidateSize());
      ro.observe(el.current);
      el.current.dispatchEvent(new Event("map-ready"));
    })();
    return () => { dead = true; ro?.disconnect(); map.current?.remove(); map.current = null; markers.current.clear(); };
  }, [mini, single]);

  // Group pins that would overlap on screen at this zoom (touch targets must not sit on top of each other).
  // Greedy and cheap: fine for tens of stays. A real dataset would use a proper clustering library.
  const groups = (m: LMap) => {
    const used = new Set<string>();
    const out: MapPin[][] = [];
    if (mini || single) return pins.map((p) => [p]);
    const pts = pins.map((p) => ({ p, pt: m.latLngToContainerPoint([p.lat, p.lng]) }));
    for (const a of pts) {
      if (used.has(a.p.id)) continue;
      const g = pts.filter((b) => !used.has(b.p.id) && Math.abs(a.pt.x - b.pt.x) < 78 && Math.abs(a.pt.y - b.pt.y) < 36);
      g.forEach((b) => used.add(b.p.id));
      out.push(g.map((b) => b.p));
    }
    return out;
  };

  const render = () => {
    const L = lib.current, m = map.current;
    if (!L || !m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current.clear();
    groups(m).forEach((g, i) => {
      if (g.length === 1) {
        const p = g[0]!;
        const on = p.id === active.current.selectedId || p.id === active.current.hoverId;
        const mk = L.marker([p.lat, p.lng], { icon: iconFor(L, p, on), zIndexOffset: on ? 1000 : 0, keyboard: false, riseOnHover: true, interactive: !mini && !single });
        if (!mini && !single) mk.on("click", (e) => { L.DomEvent.stopPropagation(e); cb.current.onSelect?.(p.id); });
        mk.addTo(m);
        markers.current.set(p.id, mk);
        return;
      }
      const lat = g.reduce((a, p) => a + p.lat, 0) / g.length;
      const lng = g.reduce((a, p) => a + p.lng, 0) / g.length;
      const label = `${g.length} ${clusterLabel}`;
      const mk = L.marker([lat, lng], {
        keyboard: false,
        icon: L.divIcon({
          className: "", iconAnchor: [0, 0],
          html: `<button type="button" aria-label="${esc(label)}, ${esc(zoomHint)}" class="-translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border border-action-primary bg-action-primary px-3 py-1 type-label text-text-on-action shadow-raised">${esc(label)}</button>`,
        }),
      });
      mk.on("click", (e) => { L.DomEvent.stopPropagation(e); m.fitBounds(L.latLngBounds(g.map((p) => [p.lat, p.lng] as [number, number])).pad(0.6), { maxZoom: 17 }); });
      mk.addTo(m);
      markers.current.set(`cluster-${i}`, mk);
    });
  };
  const renderRef = useRef(render);
  renderRef.current = render;

  // (Re)draw pins when results change, and frame them. Redraw (not reframe) when the zoom changes.
  useEffect(() => {
    const draw = () => {
      const L = lib.current, m = map.current;
      if (!L || !m) return;
      if (pins.length && single) {
        m.invalidateSize();
        m.setView([pins[0]!.lat, pins[0]!.lng], 15, { animate: false });
      } else if (pins.length) {
        m.invalidateSize(); // measure first, then frame the pins
        fitted.current = Date.now();
        m.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])).pad(0.25), { maxZoom: 13, animate: false, paddingTopLeft: [window.innerWidth >= 1024 && m.getSize().x === window.innerWidth ? 448 : 0, 0] });
      }
      renderRef.current();
      m.off("zoomend", onZoom).on("zoomend", onZoom);
    };
    const onZoom = () => renderRef.current();
    if (map.current) draw();
    const node = el.current;
    node?.addEventListener("map-ready", draw, { once: true });
    return () => { node?.removeEventListener("map-ready", draw); map.current?.off("zoomend", onZoom); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins]);

  // Highlight the selected / hovered pin and open its popup.
  useEffect(() => {
    const L = lib.current, m = map.current;
    if (!L || !m || mini || single) return;
    for (const p of pins) {
      const mk = markers.current.get(p.id);
      if (!mk) continue;
      const active = p.id === selectedId || p.id === hoverId;
      mk.setIcon(iconFor(L, p, active));
      mk.setZIndexOffset(active ? 1000 : 0);
    }
    m.closePopup();
    const sel = pins.find((p) => p.id === selectedId);
    if (sel && !markers.current.has(sel.id)) {
      // The chosen stay is hidden inside a cluster (picked from the list): zoom in until it stands alone.
      m.setView([sel.lat, sel.lng], Math.max(m.getZoom(), 15));
      return;
    }
    if (sel && popup) {
      const content = document.createElement("div");
      content.innerHTML = `<p class="type-subheading">${esc(sel.name)}</p><p class="type-body-sm">${esc(sel.label)}</p><a class="type-label text-text-link underline" href="${esc(sel.href)}">${esc(openLabel)}</a>`;
      L.popup({ offset: [0, -34], closeButton: false, autoPan: true }).setLatLng([sel.lat, sel.lng]).setContent(content).openOn(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, hoverId, pins, popup]);

  // The element Leaflet controls (`el`) must keep a STATIC className: Leaflet adds its own classes (leaflet-container, …) to it,
  // and a React re-render that rewrites className would remove them and collapse every tile to 0px wide (Tailwind's img reset).
  // So the fade-in lives on the wrapper.
  return (
    <div className={`relative ${className ?? ""} transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>
      <div ref={el} role="region" aria-label={ariaLabel} className="size-full" />
      {tilesFailed && failedLabel ? (
        <p role="status" className="type-body-sm absolute inset-x-3 top-16 z-[500] mx-auto max-w-md rounded-control bg-warning-bg px-3 py-2 text-center text-text-primary shadow-raised">{failedLabel}</p>
      ) : null}
    </div>
  );
}

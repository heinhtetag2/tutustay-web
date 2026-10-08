"use client";

import { createContext, useContext, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface MapOverlay { open: boolean; show: () => void; hide: () => void }
const Ctx = createContext<MapOverlay | null>(null);

/** Open or close the full-screen map without leaving the page. Null outside the search page. */
export const useMapOverlay = () => useContext(Ctx);

/**
 * Keeps the search page and its full-screen map as ONE page: showing or hiding the map only changes what is on screen and rewrites the
 * address (`view=map`) in place. Nothing is fetched again and the list underneath keeps its scroll position and state.
 */
export function MapOverlayHost({ initialOpen, overlay, children }: { initialOpen: boolean; overlay: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(initialOpen);
  const previousView = useRef<string | null>(null);

  const rewrite = (change: (q: URLSearchParams) => void) => {
    const q = new URLSearchParams(window.location.search);
    change(q);
    const qs = q.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  const show = () => {
    previousView.current = new URLSearchParams(window.location.search).get("view");
    rewrite((q) => q.set("view", "map"));
    setOpen(true);
  };
  const hide = () => {
    rewrite((q) => {
      q.delete("bounds");
      if (previousView.current && previousView.current !== "map") q.set("view", previousView.current); else q.delete("view");
    });
    setOpen(false);
  };

  return (
    <Ctx.Provider value={{ open, show, hide }}>
      {children}
      {open ? overlay : null}
    </Ctx.Provider>
  );
}

/** A link to the full-screen map that opens it in place (a plain click) and still works as a link when opened in a new tab. */
export function ShowMapLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const map = useMapOverlay();
  const router = useRouter();
  const onClick = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (map) map.show(); else router.push(href);
  };
  return <a href={href} onClick={onClick} className={className}>{children}</a>;
}

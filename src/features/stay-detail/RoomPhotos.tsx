"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { cn } from "@/shared/lib/cn";
import { PhotoTile } from "@/shared/ui/PhotoTile";

const chev = (d: string) => <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

/**
 * A room's pictures. On the card: a swipeable strip with arrows, a count and dots. Tapping a picture opens a full-screen viewer
 * with a big photo, arrows (or the arrow keys) and a row of thumbnails, so guests can look closely before choosing.
 */
export function RoomPhotos({ photos, name, className }: { photos: string[]; name: string; className?: string }) {
  const t = useT();
  const strip = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [big, setBig] = useState(0);
  const [openViewer, setOpenViewer] = useState(false);
  const many = photos.length > 1;

  useEffect(() => {
    if (!openViewer) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setBig((b) => (b + 1) % photos.length);
      if (e.key === "ArrowLeft") setBig((b) => (b - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [openViewer, photos.length]);

  if (photos.length === 0) return <PhotoTile alt={name} className={cn("shrink-0 rounded-field", className)} />;

  const open = (at: number) => { setBig(at); setOpenViewer(true); dialog.current?.showModal(); };
  const go = (to: number) => {
    const el = strip.current;
    if (!el) return;
    const next = (to + photos.length) % photos.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  };
  const arrow = "absolute top-1/2 z-10 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface-raised text-text-primary shadow-raised transition-opacity sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

  return (
    <>
      <div role="group" aria-roledescription="carousel" aria-label={t("room.photosOf", { name })} className={cn("group relative shrink-0 overflow-hidden rounded-field", className)}>
        <ul
          ref={strip}
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto"
        >
          {photos.map((p, i) => (
            <li key={p} aria-label={`${i + 1} / ${photos.length}`} className="relative size-full shrink-0 snap-center">
              <button type="button" onClick={() => open(i)} aria-label={t("room.photoEnlarge", { name })} className="absolute inset-0 size-full cursor-zoom-in">
                <PhotoTile src={p} alt={i === 0 ? name : ""} className="absolute inset-0 size-full" />
              </button>
            </li>
          ))}
        </ul>
        {many ? (
          <>
            <button type="button" aria-label={t("room.photoPrev")} onClick={() => go(index - 1)} className={cn(arrow, "left-2")}>{chev("M10 3 5 8l5 5")}</button>
            <button type="button" aria-label={t("room.photoNext")} onClick={() => go(index + 1)} className={cn(arrow, "right-2")}>{chev("m6 3 5 5-5 5")}</button>
            <span aria-hidden className="type-caption pointer-events-none absolute right-2 top-2 rounded-full bg-[#000000a6] px-2 py-0.5 text-[#fff]">{index + 1}/{photos.length}</span>
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
              {photos.map((p, i) => <span key={p} className={cn("size-1.5 rounded-full", i === index ? "bg-[#fff]" : "bg-[#ffffff80]")} />)}
            </span>
          </>
        ) : null}
        <span aria-hidden className="pointer-events-none absolute bottom-2 right-2 inline-flex size-7 items-center justify-center rounded-full bg-[#000000a6] text-[#fff]">
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9.500 2.500h4v4M6.500 13.500h-4v-4M13.500 2.500 9 7M2.500 13.500 7 9" /></svg>
        </span>
      </div>

      {/* Native <dialog>: focus is trapped, Escape closes. The viewer only draws its photo while open. */}
      <dialog ref={dialog} aria-label={t("room.photosOf", { name })} onClose={() => setOpenViewer(false)} className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#000000f2] p-0 text-[#fff] backdrop:bg-black">
        {openViewer ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-[var(--gutter)] py-3">
              <p className="type-label truncate">{name} · {big + 1}/{photos.length}</p>
              <button type="button" onClick={() => dialog.current?.close()} aria-label={t("common.close")} className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#ffffff26] hover:bg-[#ffffff40]">
                <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m3 3 10 10M13 3 3 13" /></svg>
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[big]} alt={`${name} ${big + 1}`} className="max-h-full max-w-full rounded-card object-contain" />
              {many ? (
                <>
                  <button type="button" aria-label={t("room.photoPrev")} onClick={() => setBig((big - 1 + photos.length) % photos.length)} className="absolute left-4 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#ffffff33] hover:bg-[#ffffff4d]">{chev("M10 3 5 8l5 5")}</button>
                  <button type="button" aria-label={t("room.photoNext")} onClick={() => setBig((big + 1) % photos.length)} className="absolute right-4 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#ffffff33] hover:bg-[#ffffff4d]">{chev("m6 3 5 5-5 5")}</button>
                </>
              ) : null}
            </div>
            {many ? (
              <ul className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
                {photos.map((p, i) => (
                  <li key={p}>
                    <button type="button" aria-label={`${i + 1} / ${photos.length}`} aria-current={i === big} onClick={() => setBig(i)} className={cn("block h-16 w-24 cursor-pointer overflow-hidden rounded-field border-2", i === big ? "border-[#fff]" : "border-transparent opacity-60 hover:opacity-100")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt="" className="size-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

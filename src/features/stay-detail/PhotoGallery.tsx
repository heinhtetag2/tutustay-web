"use client";

import { useRef } from "react";
import { useT } from "@/i18n/I18nProvider";
import { cn } from "@/shared/lib/cn";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { buildPhotoGroups } from "./photos";

/** Hero grid (one large + four) that opens a full-screen photo tour: category thumbnails, then one section per category. */
export function PhotoGallery({ stayId, name, rooms }: { stayId: string; name: string; rooms: { id: string; name: string }[] }) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const groups = buildPhotoGroups(stayId, name, rooms);
  const photos = groups.flatMap((g) => g.photos);
  const hero = photos.slice(0, 5);
  const open = () => dialog.current?.showModal();
  const goTo = (id: string) => document.getElementById(`tour-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <div className="relative -mx-[var(--gutter)] overflow-hidden md:mx-0 md:rounded-card">
        <div className="grid h-64 grid-cols-1 gap-2 md:h-[26rem] md:grid-cols-4 md:grid-rows-2">
          {hero.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={open}
              aria-label={t("stay.photos.open", { group: p.group })}
              className={cn("group relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px]", i === 0 ? "md:col-span-2 md:row-span-2" : "hidden md:block")}
            >
              <PhotoTile tone={p.tone} src={p.src} alt={p.alt} eager className="absolute inset-0 size-full transition-transform duration-300 group-hover:scale-[1.03]" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={open}
          className="type-label absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 rounded-control border border-border-control bg-surface-raised px-4 shadow-raised hover:bg-surface-subtle"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="currentColor">{[2, 8, 14].flatMap((x) => [2, 8, 14].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" />))}</svg>
          {t("stay.allPhotos")}
        </button>
      </div>

      {/* Native <dialog>: focus is trapped, Escape closes, and focus returns to the opener. */}
      <dialog ref={dialog} aria-labelledby="tour-title" className="m-0 h-dvh max-h-none w-screen max-w-none bg-surface-raised p-0 backdrop:bg-black/60">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border-subtle bg-surface-raised px-[var(--gutter)] py-3">
          <button type="button" onClick={() => dialog.current?.close()} aria-label={t("common.close")} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-subtle">
            <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <p className="type-body-sm truncate text-text-secondary">{name}</p>
        </div>
        <div className="mx-auto max-w-5xl px-[var(--gutter)] pb-16 pt-8">
          <h2 id="tour-title" className="type-title">{t("stay.photos.tour")}</h2>
          <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {groups.map((g) => {
              const first = g.photos[0];
              if (!first) return null;
              return (
                <li key={g.id} className="w-40 shrink-0">
                  <button type="button" onClick={() => goTo(g.id)} className="block w-full text-left">
                    <PhotoTile tone={first.tone} src={first.src} alt="" className="h-24 w-full rounded-field" />
                    <span className="type-body-sm mt-2 block truncate">{g.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {groups.map((g) => (
            <section key={g.id} id={`tour-${g.id}`} aria-labelledby={`tour-h-${g.id}`} className="mt-12 grid scroll-mt-20 gap-4 md:grid-cols-[1fr_2fr] md:gap-8">
              <h3 id={`tour-h-${g.id}`} className="type-heading">{g.title}</h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {g.photos.map((p) => <li key={p.id}><PhotoTile tone={p.tone} src={p.src} alt={p.alt} className="aspect-[3/2] w-full rounded-field" /></li>)}
              </ul>
            </section>
          ))}
          
        </div>
      </dialog>
    </>
  );
}

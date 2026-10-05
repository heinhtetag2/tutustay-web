"use client";

import { useRef, useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { StayMap } from "@/features/search/StayMap";

const round = "inline-flex size-11 items-center justify-center rounded-full bg-surface-raised text-text-primary shadow-raised transition-transform hover:scale-105 active:scale-95";

/** The stay's location: a roomy map with a round home pin and zoom buttons. The expand button opens it full screen. */
export function LocationMap({ name, lat, lng }: { name: string; lat: number; lng: number }) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const [full, setFull] = useState(false);
  const pins = [{ id: "here", name, lat, lng, label: "", available: true, href: "#" }];
  const map = (className: string) => (
    <StayMap variant="location" pins={pins} ariaLabel={t("stay.locationMap", { name })} openLabel="" failedLabel={t("map.tilesFailed")} className={className} />
  );

  return (
    <>
      <div className="map-controls relative mt-6 h-[18rem] overflow-hidden rounded-card border border-border-subtle md:h-[24rem]">
        {map("size-full")}
        <button type="button" aria-label={t("map.expand")} onClick={() => { setFull(true); dialog.current?.showModal(); }} className={`${round} absolute right-4 top-4 z-[500]`}>
          <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" /></svg>
        </button>
      </div>

      {/* Native <dialog>: full screen, focus trapped, Esc closes. The big map only exists while it is open. */}
      <dialog ref={dialog} aria-label={t("stay.locationMap", { name })} onClose={() => setFull(false)} className="m-0 h-dvh max-h-none w-screen max-w-none bg-surface-raised p-0 backdrop:bg-black/60">
        {full ? (
          <div className="map-controls relative size-full">
            {map("size-full")}
            <p className="type-label absolute left-4 top-4 z-[500] max-w-[60%] truncate rounded-full bg-surface-raised px-5 py-3 shadow-raised">{name}</p>
            <button type="button" aria-label={t("map.close")} onClick={() => dialog.current?.close()} className={`${round} absolute right-4 top-4 z-[500]`}>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m3 3 10 10M13 3 3 13" /></svg>
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

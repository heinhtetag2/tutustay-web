"use client";

import { useRef } from "react";
import { useT } from "@/i18n/I18nProvider";
import { Button } from "@/shared/ui/Button";
import { amenityIcon } from "./amenityIcons";

const SHOWN = 8;

/** Icon grid of what the property offers; "Show all" opens the full list in a dialog (Airbnb pattern). */
export function AmenityGrid({ items }: { items: string[] }) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const row = (f: string) => (
    <li key={f} className="flex items-center gap-4 py-3">
      <span className="text-text-primary">{amenityIcon(f)}</span>
      <span className="type-body">{f}</span>
    </li>
  );
  return (
    <>
      <ul className="grid gap-x-8 sm:grid-cols-2">{items.slice(0, SHOWN).map(row)}</ul>
      {items.length > SHOWN ? (
        <>
          <Button variant="secondary" className="mt-4" onClick={() => dialog.current?.showModal()}>{t("stay.showAllFacilities", { n: items.length })}</Button>
          <dialog ref={dialog} aria-label={t("stay.facilities")} className="m-auto w-[min(92vw,34rem)] rounded-sheet p-6 shadow-high backdrop:bg-black/50">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="type-heading">{t("stay.facilities")}</h2>
              <Button variant="secondary" onClick={() => dialog.current?.close()}>{t("common.close")}</Button>
            </div>
            <ul className="divide-y divide-border-subtle">{items.map(row)}</ul>
          </dialog>
        </>
      ) : null}
    </>
  );
}

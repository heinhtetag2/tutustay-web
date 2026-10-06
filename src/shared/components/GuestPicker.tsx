"use client";

import { useEffect, useRef } from "react";
import { LIMITS, totalGuests, type GuestCounts } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { guestSummaryText } from "../lib/guestSummary";
import { Checkbox } from "../ui/Field";
import { Stepper } from "../ui/Stepper";

export interface GuestState extends GuestCounts { foreigner: boolean }

/** Native <details> disclosure: keyboard-accessible without custom focus management. */
export function GuestPicker({ value, onChange, showRooms = true, showForeigner = true }: { value: GuestState; onChange: (v: GuestState) => void; showRooms?: boolean; showForeigner?: boolean }) {
  const t = useT();
  const n = totalGuests(value);
  const summary = guestSummaryText(t, n, value.rooms);
  const root = useRef<HTMLDetailsElement>(null);

  // A native <details> stays open until toggled again: close it on any click or focus outside, and on Escape.
  useEffect(() => {
    const close = () => { if (root.current) root.current.open = false; };
    const outside = (e: Event) => { if (root.current?.open && !root.current.contains(e.target as Node)) close(); };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && root.current?.open) { close(); root.current.querySelector("summary")?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <details ref={root} className="relative">
      <summary className="type-body flex min-h-11 cursor-pointer list-none items-center rounded-field border border-border-control bg-surface-raised px-3">
        {summary}
        {value.foreigner ? <span className="type-body-sm ml-2 text-text-secondary">· {t("guests.foreignerShort")}</span> : null}
      </summary>
      <div className="pop z-20 mt-2 flex w-full min-w-72 flex-col gap-4 rounded-card border border-border-subtle bg-surface-raised p-4 shadow-high lg:absolute lg:w-80">
        <Stepper label={t("guests.adults")} value={value.adults} min={LIMITS.adults.min} max={LIMITS.adults.max} onChange={(adults) => onChange({ ...value, adults })} />
        <Stepper label={t("guests.children")} value={value.children} min={LIMITS.children.min} max={LIMITS.children.max} onChange={(children) => onChange({ ...value, children })} />
        {showRooms ? (
          <Stepper label={t("guests.rooms")} value={value.rooms} min={LIMITS.rooms.min} max={LIMITS.rooms.max} onChange={(rooms) => onChange({ ...value, rooms })} />
        ) : null}
        {showForeigner ? (
          <Checkbox
            label={<>{t("guests.foreigner")}<span className="type-body-sm block text-text-secondary">{t("guests.foreignerHint")}</span></>}
            checked={value.foreigner}
            onChange={(e) => onChange({ ...value, foreigner: e.target.checked })}
          />
        ) : null}
      </div>
    </details>
  );
}

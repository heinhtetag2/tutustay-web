"use client";

import { useEffect, useRef } from "react";
import type { SessionHours, StayType } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { StayTypePicker } from "@/shared/components/StayTypePicker";

/** The stay type as one field of the search bar: shows "Overnight", opens a small panel with all three (and the session length). */
export function StayTypeMenu({ value, onChange }: { value: { stayType: StayType; sessionHours: SessionHours }; onChange: (v: { stayType: StayType; sessionHours: SessionHours }) => void }) {
  const t = useT();
  const root = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => { if (root.current) root.current.open = false; };
    const outside = (e: Event) => { if (root.current?.open && !root.current.contains(e.target as Node)) close(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape" && root.current?.open) { close(); root.current.querySelector("summary")?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside); document.removeEventListener("keydown", esc); };
  }, []);

  const label = value.stayType === "session" ? `${t("stayType.session")} · ${t("stayType.hours", { n: value.sessionHours })}` : t(`stayType.${value.stayType}`);
  return (
    <details ref={root} className="relative">
      <summary className="type-body flex min-h-11 cursor-pointer list-none items-center rounded-field border border-border-control bg-surface-raised px-3 [&::-webkit-details-marker]:hidden">{label}</summary>
      <div className="pop absolute left-0 z-20 mt-2 w-[min(24rem,90vw)] rounded-card border border-border-subtle bg-surface-raised p-4 text-text-primary shadow-high">
        <StayTypePicker
          stayType={value.stayType} sessionHours={value.sessionHours}
          onChange={(next) => { onChange(next); if (next.stayType !== "session" && root.current) root.current.open = false; }}
        />
      </div>
    </details>
  );
}

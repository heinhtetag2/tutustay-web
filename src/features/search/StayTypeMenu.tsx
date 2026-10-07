"use client";

import { useEffect, useRef } from "react";
import { SESSION_HOURS, STAY_TYPES, type SessionHours, type StayType } from "@/domain";
import { useT } from "@/i18n/I18nProvider";

/** The stay type as one field of the search bar: shows "Overnight", opens a small panel with all three (and the session length). */
export function StayTypeMenu({ value, onChange }: { value: { stayType: StayType; sessionHours: SessionHours }; onChange: (v: { stayType: StayType; sessionHours: SessionHours }) => void }) {
  const t = useT();
  const root = useRef<HTMLDetailsElement>(null);

  // Toggle on mouse-down, not on click: the search bar widens as soon as the field is pressed, so by mouse-up the field has moved and the click would be lost.
  const downHandled = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !root.current) return;
    e.preventDefault();
    downHandled.current = true;
    root.current.open = !root.current.open;
  };
  const onClick = (e: React.MouseEvent) => { if (downHandled.current) { e.preventDefault(); downHandled.current = false; } };

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
      <summary onPointerDown={onPointerDown} onClick={onClick} className="type-body flex min-h-11 cursor-pointer list-none items-center rounded-field border border-border-control bg-surface-raised px-3 [&::-webkit-details-marker]:hidden">{label}</summary>
      <div className="pop absolute left-0 z-20 mt-3 w-[min(18rem,90vw)] rounded-sheet border border-border-subtle bg-surface-raised p-2 text-text-primary shadow-high">
        <div role="radiogroup" aria-label={t("stayType.label")} className="flex flex-col">
          {STAY_TYPES.map((s) => {
            const on = s === value.stayType;
            return (
              <button
                key={s} type="button" role="radio" aria-checked={on}
                onClick={() => { onChange({ stayType: s, sessionHours: value.sessionHours }); if (s !== "session" && root.current) root.current.open = false; }}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-field px-4 py-3 text-left transition-colors ${on ? "bg-surface-subtle" : "hover:bg-surface-subtle"}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-5">{t(`stayType.${s}`)}</span>
                  <span className="block text-sm font-normal leading-5 text-text-secondary">{t(`stayType.${s}.desc`)}</span>
                </span>
                <span aria-hidden className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${on ? "border-action-primary bg-action-primary" : "border-border-control"}`}>
                  {on ? <span className="size-1.5 rounded-full bg-surface-raised" /> : null}
                </span>
              </button>
            );
          })}
        </div>
        {value.stayType === "session" ? (
          <div className="mt-1 border-t border-border-subtle px-4 pb-3 pt-4">
            <p className="mb-3 text-sm font-medium leading-5">{t("stayType.sessionLength")}</p>
            <div className="flex flex-wrap gap-2">
              {SESSION_HOURS.map((h) => (
                <button
                  key={h} type="button" aria-pressed={value.sessionHours === h}
                  onClick={() => { onChange({ stayType: "session", sessionHours: h }); if (root.current) root.current.open = false; }}
                  className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-medium ${value.sessionHours === h ? "border-action-primary bg-action-primary text-text-on-action" : "border-border-subtle hover:bg-surface-subtle"}`}
                >
                  {t("stayType.hours", { n: h })}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
}

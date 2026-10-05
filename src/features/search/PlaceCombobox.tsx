"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { Input } from "@/shared/ui/Field";

const TINTS = ["#e8f3fb", "#fdf0e3", "#e6f4ea", "#f7e9f3", "#fbeaea", "#efeafc"];

export interface NearbyOption { active: boolean; state: "idle" | "asking" | "denied" | "unavailable"; onAsk: () => void; onStop: () => void }

type Row = { kind: "near" } | { kind: "place"; name: string; tint: string };

/**
 * Place field with a suggestion panel that drops in under the input (ARIA combobox: arrows, Enter, Escape).
 * "Nearby" comes first, as on Airbnb: choosing it asks for the device location once (see SearchBar).
 */
export function PlaceCombobox({ id, value, onChange, options, placeholder, nearby }: { id: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string; nearby?: NearbyOption }) {
  const t = useT();
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const q = value.trim().toLowerCase();
  const rows: Row[] = [
    ...(nearby && !q ? [{ kind: "near" } as const] : []),
    ...options.filter((o) => !q || o.toLowerCase().includes(q)).slice(0, 8).map((name, i) => ({ kind: "place" as const, name, tint: TINTS[i % TINTS.length]! })),
  ];

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  function choose(r: Row) {
    if (r.kind === "near") { nearby?.active ? nearby.onStop() : nearby?.onAsk(); return; } // stays open to show a denial message
    onChange(r.name); setOpen(false); setActive(-1);
  }

  return (
    <div ref={root} className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, rows.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && open && active >= 0 && rows[active]) { e.preventDefault(); choose(rows[active]!); }
          else if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); }
        }}
      />
      {open ? (
        <div className="anim-drop absolute left-0 top-full z-30 mt-4 w-[min(30rem,calc(100vw-2rem))] rounded-sheet bg-surface-raised p-3 text-left shadow-high">
          <p className="type-label px-3 pb-2 pt-2 font-normal text-text-secondary">{t("search.suggested")}</p>
          {rows.length === 0 ? <p className="type-body-sm px-3 pb-3 text-text-secondary">{t("search.noPlaces")}</p> : null}
          <ul id={listId} role="listbox" aria-label={t("search.suggested")} className="max-h-96 overflow-y-auto">
            {rows.map((r, i) => (
              <li key={r.kind === "near" ? "near" : r.name} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={r.kind === "near" && nearby?.state === "asking"}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(r)}
                  onMouseEnter={() => setActive(i)}
                  className={`press flex w-full items-center gap-4 rounded-field px-3 py-2.5 text-left transition-colors ${i === active ? "bg-surface-subtle" : ""}`}
                >
                  <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-field" style={{ background: r.kind === "near" ? "#eaf2fb" : r.tint }}>
                    {r.kind === "near" ? (
                      <svg viewBox="0 0 24 24" className={`size-6 text-text-brand ${nearby?.state === "asking" ? "animate-pulse" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M20.5 3.5 3.8 10.3l6.6 2.4 2.4 6.6z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="size-6 text-text-primary" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>
                    )}
                  </span>
                  <span className="min-w-0">
                    {r.kind === "near" ? (
                      <>
                        <span className="type-label block font-semibold">{nearby?.active ? t("near.stop") : t("near.option")}</span>
                        <span className="type-body-sm block text-text-secondary">{t("near.explain")}</span>
                      </>
                    ) : (
                      <>
                        <span className="type-label block truncate font-semibold">{r.name}</span>
                        <span className="type-body-sm block truncate text-text-secondary">{t("search.suggestedHint", { place: r.name })}</span>
                      </>
                    )}
                  </span>
                </button>
                {r.kind === "near" && nearby?.state === "denied" ? <p role="status" className="type-body-sm px-3 pb-2 text-warning-text">{t("near.denied")}</p> : null}
                {r.kind === "near" && nearby?.state === "unavailable" ? <p role="status" className="type-body-sm px-3 pb-2 text-warning-text">{t("near.unavailable")}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

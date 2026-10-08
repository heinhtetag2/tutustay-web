"use client";

import { useEffect, useRef } from "react";
import type { PropertyCategory } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";

const CATEGORIES: PropertyCategory[] = ["hotel", "motel", "resort", "campsite"];

/** The property type as one field of the home search bar: shows "All property types" or the chosen one, opens a small panel with an icon per type. */
export function PropertyTypeMenu({ value, onChange }: { value: PropertyCategory | undefined; onChange: (v: PropertyCategory | undefined) => void }) {
  const t = useT();
  const root = useRef<HTMLDetailsElement>(null);

  // Same as the stay type field: toggle on mouse-down, because the bar moves as soon as a field is pressed.
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

  const options: { key: PropertyCategory | undefined; label: string }[] = [
    { key: undefined, label: t("filter.allCategories") },
    ...CATEGORIES.map((c) => ({ key: c, label: t(`category.${c}`) })),
  ];
  const current = options.find((o) => o.key === value) ?? options[0]!;
  return (
    <details ref={root} className="relative">
      <summary onPointerDown={onPointerDown} onClick={onClick} aria-label={t("filter.category")} className="type-body flex min-h-11 cursor-pointer list-none items-center rounded-field border border-border-control bg-surface-raised px-3 [&::-webkit-details-marker]:hidden">
        <span className="truncate">{current.label}</span>
      </summary>
      <ul role="listbox" aria-label={t("filter.category")} className="pop absolute left-0 z-20 mt-3 w-[min(18rem,90vw)] rounded-sheet border border-border-subtle bg-surface-raised p-2 text-text-primary shadow-high">
        {options.map((o) => {
          const on = o.key === value;
          return (
            <li key={o.key ?? "all"} role="option" aria-selected={on}>
              <button
                type="button" onClick={() => { onChange(o.key); if (root.current) root.current.open = false; }}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-field px-3 py-2.5 text-left transition-colors ${on ? "bg-surface-subtle" : "hover:bg-surface-subtle"}`}
              >
                <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand"><CategoryIcon name={o.key ?? "all"} className="size-4" /></span>
                <span className="flex-1 text-sm font-medium leading-5">{o.label}</span>
                {on ? <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

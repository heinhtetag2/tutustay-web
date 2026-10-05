"use client";

import { Children, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface Opt { value: string; label: string; disabled: boolean }

const text = (n: ReactNode): string => (Array.isArray(n) ? n.map(text).join("") : typeof n === "string" || typeof n === "number" ? String(n) : "");

function readOptions(children: ReactNode): Opt[] {
  const out: Opt[] = [];
  Children.forEach(children, (c) => {
    if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(c)) return;
    const label = text(c.props.children);
    out.push({ value: c.props.value === undefined ? label : String(c.props.value), label, disabled: Boolean(c.props.disabled) });
  });
  return out;
}

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  invalid?: boolean;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
};

/**
 * Our own dropdown: same props as a native <select> (children are <option>s, onChange gets `e.target.value`),
 * but the list opens as a styled panel instead of the browser's menu. Submits through a hidden input, so forms keep working.
 */
export function Select({ invalid, className, children, value, defaultValue, onChange, name, id, disabled, required, ...aria }: Props) {
  const options = readOptions(children);
  const [inner, setInner] = useState(String(defaultValue ?? options[0]?.value ?? ""));
  const current = value !== undefined ? String(value) : inner;
  const selected = options.find((o) => o.value === current) ?? options[0];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const choose = (o: Opt) => {
    if (o.disabled) return;
    setInner(o.value);
    setOpen(false);
    if (o.value !== current) onChange?.({ target: { value: o.value, name }, currentTarget: { value: o.value, name } } as unknown as ChangeEvent<HTMLSelectElement>);
  };

  useLayoutEffect(() => {
    if (!open || !root.current) return;
    const r = root.current.getBoundingClientRect();
    setUp(innerHeight - r.bottom < 280 && r.top > innerHeight - r.bottom);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  useEffect(() => { if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" }); }, [open, active]);

  const openList = () => { setActive(Math.max(0, options.findIndex((o) => o.value === current))); setOpen(true); };
  const step = (d: number) => {
    let i = active;
    for (let n = 0; n < options.length; n++) { i = (i + d + options.length) % options.length; if (!options[i]!.disabled) break; }
    setActive(i);
  };
  const onKey = (e: KeyboardEvent) => {
    if (!open) { if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openList(); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(options[active]!); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={root} className={cn("relative", className?.includes("w-auto") ? "w-auto" : "w-full")}>
      {name ? <input type="hidden" name={name} value={current} /> : null}
      <button
        type="button" id={id} disabled={disabled} role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} aria-required={required}
        aria-invalid={invalid || undefined} aria-describedby={aria["aria-describedby"]} aria-label={aria["aria-label"]}
        onClick={() => (open ? setOpen(false) : openList())} onKeyDown={onKey}
        className={cn(
          "type-body flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-field border bg-surface-raised py-2 pl-3 pr-3 text-left text-text-primary transition-colors hover:border-text-primary disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-disabled",
          invalid ? "border-error-text" : open ? "border-text-primary" : "border-border-control",
          className,
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <svg aria-hidden viewBox="0 0 16 16" className={cn("size-4 shrink-0 text-text-secondary transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      {open ? (
        <ul
          ref={list} id={listId} role="listbox" aria-label={aria["aria-label"]}
          className={cn("absolute left-0 z-30 max-h-64 w-max min-w-full max-w-[min(24rem,90vw)] overflow-auto rounded-card border border-border-subtle bg-surface-raised p-1.5 shadow-raised", up ? "bottom-full mb-2" : "top-full mt-2")}
        >
          {options.map((o, i) => (
            <li
              key={o.value} role="option" aria-selected={o.value === current} aria-disabled={o.disabled || undefined}
              onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(o)}
              className={cn("type-body-sm flex min-h-10 cursor-pointer items-center justify-between gap-6 rounded-control px-3", i === active && "bg-surface-subtle", o.value === current && "font-medium", o.disabled && "cursor-not-allowed text-text-disabled")}
            >
              <span>{o.label}</span>
              {o.value === current ? <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.500 8.500 3 3 6-7" /></svg> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

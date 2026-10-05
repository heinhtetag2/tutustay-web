"use client";

import { cn } from "../lib/cn";

interface Props { label: string; value: number; min: number; max: number; onChange: (n: number) => void; className?: string; hint?: string }

/** Accessible number stepper: labelled group, live value, 44px targets, disabled at limits. */
export function Stepper({ label, value, min, max, onChange, className, hint }: Props) {
  const btn = "inline-flex size-11 items-center justify-center rounded-full border border-border-control type-subheading disabled:text-text-disabled disabled:border-border-subtle hover:bg-surface-subtle";
  return (
    <div role="group" aria-label={label} className={cn("flex items-center justify-between gap-4", className)}>
      <div>
        <p className="type-label">{label}</p>
        {hint ? <p className="type-body-sm text-text-secondary">{hint}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} aria-label={`${label}: −`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <output aria-live="polite" className="type-price-sm min-w-6 text-center">{value}</output>
        <button type="button" className={btn} aria-label={`${label}: +`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

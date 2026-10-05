import { cn } from "../lib/cn";

/**
 * Placeholder logo mark: an empty brand-blue rounded tile, standing in until a real logo is supplied (the real TuTuStay logo
 * is deliberately not used in this revamp). Used by the header and by empty-photo placeholders. Size it with a `size-*` class.
 * To add a logo later, render an <img> inside the span.
 */
export function LogoMark({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block shrink-0 rounded-[8px] bg-brand", className)} />;
}

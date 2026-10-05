import { cn } from "../lib/cn";
import { LogoMark } from "./LogoMark";

/**
 * Stands in for property photos until real images exist: the TuTuStay logo, quiet, on a soft surface (an "empty image" state).
 * Decorative (aria-hidden): the surrounding text already names the stay or room.
 */
export function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex shrink-0 items-center justify-center bg-surface-subtle", className)}>
      <LogoMark className="size-[40%] min-h-10 min-w-10 max-h-28 max-w-28 opacity-60" />
    </div>
  );
}

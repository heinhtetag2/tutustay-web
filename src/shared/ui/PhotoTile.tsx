import { cn } from "../lib/cn";
import { LogoMark } from "./LogoMark";

/**
 * A photo when `src` is given (with meaningful `alt`), otherwise a tinted placeholder that varies by `tone` (0–359)
 * so a gallery still reads as several photos. The placeholder is decorative.
 */
export function PhotoTile({ tone = 200, src, alt = "", eager, className }: { tone?: number; src?: string; alt?: string; eager?: boolean; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- local demo assets, sized by the parent
    return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className={cn("object-cover", className)} />;
  }
  return (
    <div
      aria-hidden
      className={cn("flex items-center justify-center", className)}
      style={{ background: `linear-gradient(135deg, hsl(${tone} 38% 90%), hsl(${(tone + 40) % 360} 34% 82%))` }}
    >
      <LogoMark className="size-1/5 min-h-6 min-w-6 max-h-16 max-w-16 opacity-40" />
    </div>
  );
}

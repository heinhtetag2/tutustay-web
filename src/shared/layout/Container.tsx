import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const widths = { narrow: "max-w-[var(--container-narrow)]", content: "max-w-[var(--container-content)]", wide: "max-w-[var(--container-wide)]" } as const;

/** Page-width wrapper. All pages share one left edge with the header logo via the same gutter. */
export function Container({ size = "content", className, children }: { size?: keyof typeof widths; className?: string; children: ReactNode }) {
  // `narrow` is a reading/form column, not a different page edge: it sits on the same left edge as the header, just limited in width.
  const column = size === "narrow";
  return (
    <div data-container={size} className={cn("mx-auto w-full px-[var(--gutter)]", column ? widths.content : widths[size], className)}>
      {column ? <div className="max-w-[var(--container-narrow)]">{children}</div> : children}
    </div>
  );
}

/** Vertical rhythm: 48 between sections on desktop, 32 on mobile. */
export function Section({ className, children, id, divided }: { className?: string; children: ReactNode; id?: string; divided?: boolean }) {
  return <section id={id} className={cn("scroll-mt-24 py-8 md:py-12", divided && "border-t border-border-subtle", className)}>{children}</section>;
}

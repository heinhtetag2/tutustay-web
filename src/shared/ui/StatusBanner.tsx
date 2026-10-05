import type { ReactNode } from "react";
import type { Tone } from "./Badge";
import { cn } from "../lib/cn";

const styles: Record<Exclude<Tone, "neutral" | "promo">, string> = {
  info: "bg-info-bg text-info-text",
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  error: "bg-error-bg text-error-text",
};
const icons = { info: "i", success: "✓", warning: "!", error: "×" } as const;

export function StatusBanner({
  tone = "info", title, children, className,
}: { tone?: keyof typeof styles; title?: string; children?: ReactNode; className?: string }) {
  return (
    <div role={tone === "error" || tone === "warning" ? "alert" : "status"} className={cn("flex gap-3 rounded-field p-4", styles[tone], className)}>
      <span aria-hidden className="type-label mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-current">{icons[tone]}</span>
      <div className="type-body-sm text-text-primary">
        {title ? <p className="type-label" style={{ color: "inherit" }}>{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

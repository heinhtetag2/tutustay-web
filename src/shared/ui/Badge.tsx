import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type Tone = "neutral" | "success" | "warning" | "error" | "info" | "promo";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-subtle text-text-secondary",
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  error: "bg-error-bg text-error-text",
  info: "bg-info-bg text-info-text",
  promo: "bg-promo-bg text-promo-text",
};

/** Status is never colour alone: always pair a Badge with its text label. */
export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("type-label inline-flex items-center rounded-control px-2 py-0.5", tones[tone], className)}>{children}</span>;
}

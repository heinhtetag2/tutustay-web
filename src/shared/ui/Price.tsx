import { formatKs } from "@/domain";
import { cn } from "../lib/cn";

type Size = "lg" | "md" | "sm";
const cls: Record<Size, string> = { lg: "type-price-lg", md: "type-price-md", sm: "type-price-sm" };

/** Prices always show currency AND unit. Never truncate. `unit` is already translated text. */
export function Price({ amount, unit, size = "md", prefix, className }: { amount: number; unit?: string; size?: Size; prefix?: string; className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-1", className)}>
      {prefix ? <span className="type-body-sm text-text-secondary font-normal">{prefix}</span> : null}
      <span className={cls[size]}>{formatKs(amount)}</span>
      {unit ? <span className="type-body-sm text-text-secondary font-normal">{unit}</span> : null}
    </span>
  );
}

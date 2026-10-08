"use client";

import type { PriceBreakdown as Breakdown } from "@/domain";
import { formatKs } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { cn } from "@/shared/lib/cn";

/**
 * Price details, shared by room cards and the review step.
 * Shows the whole stay, fees included, and splits PAY NOW from PAY AT PROPERTY.
 * ASSUMPTION: fee and deposit values are mock (docs/04 Q1, Q8).
 */
export function PriceBreakdown({ price, className }: { price: Breakdown; className?: string }) {
  const t = useT();
  const row = "flex items-baseline justify-between gap-4";
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <dl className="type-body-sm flex flex-col gap-2">
        {price.lines.map((l) => (
          <div key={l.key} className={row}>
            <dt className="text-text-secondary">
              {l.key === "rate" && l.label
                ? `${l.label} · ${formatKs(l.rate ?? price.unitRate)} × ${l.quantity ?? 1}`
                : l.key === "rate"
                ? t(
                    `price.line.${l.unit === "night" ? "night" : "stay"}${(l.quantity ?? 1) === 1 ? "One" : "Many"}` as "price.line.nightOne",
                    { rate: formatKs(price.unitRate), n: l.quantity ?? 1 },
                  )
                : t(l.key === "discount" ? "price.line.discount" : "price.line.platformFee")}
            </dt>
            <dd className={cn("type-price-sm", l.amount < 0 && "text-success-text")}>{l.amount < 0 ? `− ${formatKs(-l.amount)}` : formatKs(l.amount)}</dd>
          </div>
        ))}
      </dl>
      <div className={cn(row, "border-t border-border-subtle pt-3")}>
        <span className="type-label">{t("price.total")}</span>
        <span className="type-price-lg">{formatKs(price.total)}</span>
      </div>
      <dl className="type-body-sm mt-1 flex flex-col gap-1 rounded-field bg-surface-subtle p-3">
        <div className={row}>
          <dt>{t("price.payNow")}</dt>
          <dd className="type-price-sm">{formatKs(price.payNow)}</dd>
        </div>
        <div className={row}>
          <dt>{t("price.payAtProperty")}</dt>
          <dd className="type-price-sm">{formatKs(price.payAtProperty)}</dd>
        </div>
      </dl>
      <p className="type-body-sm text-text-secondary">{t(price.mode === "pay_at_hotel" ? "price.next.cash" : "price.next.deposit")}</p>
    </div>
  );
}

"use client";

import { computePrice, formatKs, type PaymentMode, type StayType } from "@/domain";
import { ASSUMED_PRICING_RULES } from "@/config/pricing";
import { useT } from "@/i18n/I18nProvider";
import { PriceBreakdown } from "@/features/booking/PriceBreakdown";
import { Price } from "@/shared/ui/Price";

interface Props { rate: number; nights: number; rooms: number; stayType: StayType; mode: PaymentMode; depositPct?: number }

/** Per-room price: unit rate, stay total and what is paid online vs at the property. */
export function RoomPrice({ rate, nights, rooms, stayType, mode, depositPct }: Props) {
  const t = useT();
  const price = computePrice({ unitRate: rate, nights, rooms, stayType, mode, depositPct, rules: ASSUMED_PRICING_RULES });
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Price amount={rate} size="md" unit={stayType === "overnight" ? t("price.perNight") : t("price.perStay")} />
      <p className="type-body-sm text-text-secondary">
        {t("price.totalFor", { total: formatKs(price.total) })}
        {price.payNow > 0 ? ` · ${t("price.payNowShort", { amount: formatKs(price.payNow) })}` : ` · ${t("price.payAtPropertyShort")}`}
      </p>
      <details className="type-body-sm w-full max-w-sm">
        <summary className="cursor-pointer text-text-link">{t("price.details")}</summary>
        <div className="mt-3 rounded-field border border-border-subtle bg-surface-raised p-3"><PriceBreakdown price={price} /></div>
      </details>
    </div>
  );
}

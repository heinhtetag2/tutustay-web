"use client";

import type { PaymentMode } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { Badge } from "../ui/Badge";

/** Every stay says how it is paid (Terms §06), so guests know before they choose a room. */
export function PaymentModeBadge({ mode, depositPct }: { mode: PaymentMode; depositPct?: number }) {
  const t = useT();
  if (mode === "pay_at_hotel") return <Badge tone="info">{t("payment.payAtHotel")}</Badge>;
  return <Badge tone="promo">{depositPct && depositPct < 100 ? t("payment.onlineDeposit", { pct: depositPct }) : t("payment.online")}</Badge>;
}

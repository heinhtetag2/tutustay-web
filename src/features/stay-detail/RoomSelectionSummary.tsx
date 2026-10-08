"use client";

import { useSearchParams } from "next/navigation";
import { computePrice, formatKs, type PaymentMode, type StayType } from "@/domain";
import { ASSUMED_PRICING_RULES } from "@/config/pricing";
import { useT } from "@/i18n/I18nProvider";
import { LocalLink } from "@/shared/components/LocalLink";
import { cn } from "@/shared/lib/cn";
import { parseSelection, serializeSelection } from "./selection";

export interface SelectableRoom { id: string; name: string; rate: number; available: number; capacity: number }

interface Props {
  stayId: string;
  rooms: SelectableRoom[];
  nights: number;
  stayType: StayType;
  mode: PaymentMode;
  depositPct?: number;
  guests: number;
  /** Search state carried into the booking step (dates, guests, stay type). */
  query: string;
  className?: string;
}

/** What has been picked, the total, and the one button that moves on. A booking can hold several rooms, so the button lives here and not on a room. */
export function RoomSelectionSummary({ stayId, rooms, nights, stayType, mode, depositPct, guests, query, className }: Props) {
  const t = useT();
  const search = useSearchParams();
  const sel = parseSelection(search.get("sel") ?? undefined);
  const chosen = rooms.filter((r) => (sel[r.id] ?? 0) > 0).map((r) => ({ ...r, qty: Math.min(sel[r.id]!, r.available) }));
  const count = chosen.reduce((n, r) => n + r.qty, 0);
  const capacity = chosen.reduce((n, r) => n + r.qty * r.capacity, 0);
  const tooSmall = count > 0 && capacity < guests;
  const price = count > 0
    ? computePrice({ unitRate: 0, nights, rooms: 1, stayType, mode, depositPct, rules: ASSUMED_PRICING_RULES, items: chosen.map((r) => ({ label: r.name, unitRate: r.rate, rooms: r.qty })) })
    : null;
  const href = `/stays/${stayId}/book?${query}&sel=${serializeSelection(Object.fromEntries(chosen.map((r) => [r.id, r.qty])))}`;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h2 className="type-subheading">{t("room.yourSelection")}</h2>
      {chosen.length === 0 ? (
        <p className="type-body-sm text-text-secondary">{t("room.selectHint")}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-1.5">
            {chosen.map((r) => (
              <li key={r.id} className="type-body-sm flex items-baseline justify-between gap-3">
                <span className="min-w-0">{r.qty} × {r.name}</span>
                <span className="shrink-0 font-semibold">{formatKs(r.rate * r.qty * (stayType === "overnight" ? nights : 1))}</span>
              </li>
            ))}
          </ul>
          {price ? (
            <div className="flex items-baseline justify-between gap-3 border-t border-border-subtle pt-3">
              <span className="type-label">{t("price.total")}</span>
              <span className="type-price-md">{formatKs(price.total)}</span>
            </div>
          ) : null}
          {price && price.payNow > 0 ? <p className="type-body-sm text-text-secondary">{t("price.payNowShort", { amount: formatKs(price.payNow) })}</p> : null}
          {tooSmall ? <p role="alert" className="type-body-sm text-error-text">{t("room.tooSmall", { guests, capacity })}</p> : null}
        </>
      )}
      {count > 0 && !tooSmall ? (
        <LocalLink href={href} className="type-label inline-flex min-h-12 items-center justify-center rounded-full bg-action-cta px-6 text-text-on-action hover:bg-action-cta-hover">{t("room.continue", { n: count })}</LocalLink>
      ) : (
        <span aria-disabled="true" className="type-label inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-full bg-surface-subtle px-6 text-text-secondary">{t("room.continue", { n: count })}</span>
      )}
      <p className="type-body-sm text-center text-text-secondary">{t("booking.nothingChargedYet")}</p>
    </div>
  );
}

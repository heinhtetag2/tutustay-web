import { roundKs } from "./money";
import type { StayType } from "./room";

/**
 * How a stay is paid, set PER STAY (Terms of Service §06 lists both models on the platform):
 *  - pay_at_hotel: the guest settles directly with the property. TuTuStay takes no payment.
 *  - online: paid through the integrated provider (KBZPay / QPay), generally after the hotel accepts.
 */
export type PaymentMode = "pay_at_hotel" | "online";

/**
 * ASSUMPTION, NOT A BUSINESS RULE: the platform-fee amount. FAQ says a fee exists, Terms is silent (docs/04 Q8).
 * Deposit percentage is per stay (FAQ: "varies depending on the hotel"), so it travels with the stay.
 */
export interface PricingRules {
  platformFee: Record<PaymentMode, number>;
}

export interface PriceLine {
  key: "rate" | "discount" | "platformFee";
  quantity?: number;
  unit?: "night" | "stay";
  amount: number;
}

export interface PriceBreakdown {
  lines: PriceLine[];
  unitRate: number;
  subtotal: number;
  discount: number;
  platformFee: number;
  total: number;
  /** What the guest pays online (after the hotel accepts). 0 for pay_at_hotel. */
  payNow: number;
  /** What the guest pays the property. */
  payAtProperty: number;
  mode: PaymentMode;
}

export interface PricingInput {
  unitRate: number;
  nights: number;
  rooms: number;
  stayType: StayType;
  discount?: number;
  mode: PaymentMode;
  /** Share of the booking paid online, 1–100. Only used for `online`. */
  depositPct?: number;
  rules: PricingRules;
}

export function computePrice(input: PricingInput): PriceBreakdown {
  const { unitRate, rooms, stayType, mode, rules } = input;
  // Session and daycation are priced per stay, not per night.
  const units = stayType === "overnight" ? Math.max(1, input.nights) : 1;
  const subtotal = unitRate * units * Math.max(1, rooms);
  const discount = Math.min(input.discount ?? 0, subtotal);
  const platformFee = rules.platformFee[mode];
  const total = subtotal - discount + platformFee;

  let payNow = 0;
  if (mode === "online") {
    const pct = Math.min(100, Math.max(1, input.depositPct ?? 100));
    payNow = Math.min(total, roundKs((subtotal - discount) * (pct / 100)) + platformFee);
  }

  const lines: PriceLine[] = [
    { key: "rate", quantity: units * Math.max(1, rooms), unit: stayType === "overnight" ? "night" : "stay", amount: subtotal },
  ];
  if (discount > 0) lines.push({ key: "discount", amount: -discount });
  if (platformFee > 0) lines.push({ key: "platformFee", amount: platformFee });

  return { lines, unitRate, subtotal, discount, platformFee, total, payNow, payAtProperty: total - payNow, mode };
}

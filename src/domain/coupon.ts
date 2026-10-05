export interface Coupon {
  code: string;
  title: string;
  kind: "percent" | "fixed";
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  /** ISO date, inclusive. */
  expires: string;
}

export type CouponResult =
  | { ok: true; discount: number }
  | { ok: false; reason: "unknown" | "expired" | "min_spend" };

export function applyCoupon(coupon: Coupon | undefined, subtotal: number, today: string): CouponResult {
  if (!coupon) return { ok: false, reason: "unknown" };
  if (coupon.expires < today) return { ok: false, reason: "expired" };
  if (coupon.minSpend && subtotal < coupon.minSpend) return { ok: false, reason: "min_spend" };
  const raw = coupon.kind === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  return { ok: true, discount: Math.min(capped, subtotal) };
}

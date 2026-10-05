import type { Coupon } from "@/domain";
import { COUPONS } from "./mocks/fixtures";

/** MOCK. Real coupons must be account-bound on a server (docs/02 C-6); claims here live in the browser. */
export function listCoupons(): Coupon[] {
  return COUPONS;
}

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
}

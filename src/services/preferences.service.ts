import { createLocalStore } from "./mocks/localStore";

/** Coupon codes "claimed" in this browser. Real claims must live on the account (docs/02 C-6). */
export const claimedCouponsStore = createLocalStore<string[]>("claimedCoupons", []);

/**
 * DEMO: starts every browser with nothing claimed (once, per demo version), so all deals show a "Claim" button
 * and claiming one moves it to the Claimed tab. After that the guest's own claims are never touched.
 */
export function seedDemoClaims(): void {
  const flag = "tutustay.mock.demoClaimsSeeded";
  try {
    if (window.localStorage.getItem(flag) === "3") return;
    window.localStorage.setItem(flag, "3");
  } catch { return; }
  claimedCouponsStore.set([]);
}

/** Stays the user has saved (hearted). Mock: stored in this browser only. */
export const favoritesStore = createLocalStore<string[]>("favorites", []);

/** Stays picked for side-by-side comparison. Mock: stored in this browser only. */

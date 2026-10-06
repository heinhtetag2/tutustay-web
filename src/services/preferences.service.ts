import { createLocalStore } from "./mocks/localStore";

/** Coupon codes "claimed" in this browser. Real claims must live on the account (docs/02 C-6). */
export const claimedCouponsStore = createLocalStore<string[]>("claimedCoupons", []);

/** Stays the user has saved (hearted). Mock: stored in this browser only. */
export const favoritesStore = createLocalStore<string[]>("favorites", []);

/** Stays picked for side-by-side comparison. Mock: stored in this browser only. */

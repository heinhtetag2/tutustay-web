import { REVIEWS } from "./mocks/fixtures";

export function listReviews(stayId: string) {
  return REVIEWS[stayId] ?? [];
}

import { createLocalStore } from "./mocks/localStore";

/** MOCK. Submitted reviews live in this browser only, keyed by booking reference. */
export interface SubmittedReview { bookingRef: string; rating: number; text: string }
export const submittedReviewsStore = createLocalStore<SubmittedReview[]>("reviews", []);

export function submitReview(r: SubmittedReview): void {
  submittedReviewsStore.set([r, ...submittedReviewsStore.get().filter((x) => x.bookingRef !== r.bookingRef)]);
}

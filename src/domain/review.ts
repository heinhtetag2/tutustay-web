import type { Booking } from "./booking";

/** BR-07 / Terms §07: a review must attach to a real booking, so only completed bookings, once each. */
export function canReview(booking: Pick<Booking, "status">, alreadyReviewed: boolean): boolean {
  return booking.status === "completed" && !alreadyReviewed;
}

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Score bands as seen in the live search filter: 4.5+ Fantastic, 4+ Excellent, 3+ Comfort, 2+ Fair. */
export type RatingLabel = "fantastic" | "excellent" | "comfort" | "fair" | "low";

export function ratingLabel(score: number): RatingLabel {
  if (score >= 4.5) return "fantastic";
  if (score >= 4) return "excellent";
  if (score >= 3) return "comfort";
  if (score >= 2) return "fair";
  return "low";
}

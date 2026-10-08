import type { PaymentMode, PriceBreakdown } from "./pricing";
import type { GuestType, SessionHours, StayType } from "./room";

/**
 * The seven booking stages, exactly as defined in the Terms of Service §04.
 * A booking is a REQUEST first: nothing is held until the hotel accepts.
 */
export type BookingStatus = "pending" | "accepted" | "confirmed" | "overdue" | "rejected" | "cancelled" | "completed";

export const FINAL_STATUSES: BookingStatus[] = ["rejected", "cancelled", "completed"];

/**
 * Allowed moves. Source: Terms §04. Inferences are marked:
 *  - overdue → confirmed: Terms says an overdue room "is still held, but at risk", so late payment can still confirm.
 *  - accepted → completed: [assumption] pay-at-hotel stays have no online payment, so they go accepted → completed.
 *  - pending → cancelled: [product decision] a guest can withdraw a request that nobody has accepted or paid yet (the Terms list cancellation only for accepted, overdue or confirmed bookings).
 */
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["confirmed", "overdue", "cancelled", "completed"],
  confirmed: ["cancelled", "completed"],
  overdue: ["confirmed", "cancelled"],
  rejected: [],
  cancelled: [],
  completed: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function allowedTransitions(from: BookingStatus): BookingStatus[] {
  return TRANSITIONS[from];
}

/**
 * Moves that make sense for THIS booking. Pay-at-hotel stays have no online payment, so they never go
 * through confirmed/overdue; online stays complete only after payment has confirmed them.
 */
export function nextStatusesFor(b: Pick<Booking, "status" | "mode">): BookingStatus[] {
  const base = allowedTransitions(b.status);
  if (b.mode === "pay_at_hotel") return base.filter((s) => s !== "confirmed" && s !== "overdue");
  return b.status === "accepted" ? base.filter((s) => s !== "completed") : base;
}

export function isFinal(status: BookingStatus): boolean {
  return FINAL_STATUSES.includes(status);
}

/** Every booking starts as a request, whatever the payment mode. */
export const INITIAL_STATUS: BookingStatus = "pending";

/** Whether the guest is currently expected to pay online. */
export function needsOnlinePayment(b: Pick<Booking, "status" | "mode">): boolean {
  return b.mode === "online" && (b.status === "accepted" || b.status === "overdue");
}

export interface Booking {
  ref: string;
  /** Always true in this foundation: no backend exists behind these records. */
  isMock: true;
  status: BookingStatus;
  mode: PaymentMode;
  createdAt: string;
  /** ISO time the online payment is due, set when the hotel accepts. MOCK window: see config. */
  payBy?: string;
  stayId: string;
  stayName: string;
  stayPhone: string;
  roomId: string;
  roomName: string;
  stayType: StayType;
  sessionHours?: SessionHours;
  /** For sessions and daycations: when the stay starts and ends (HH:MM). */
  startTime?: string;
  endTime?: string;
  endsNextDay?: boolean;
  guestType: GuestType;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  guest: { name: string; phone: string; email: string; bookingForOther: boolean; stayingGuestName?: string };
  specialRequests?: string;
  couponCode?: string;
  refundable: boolean;
  price: PriceBreakdown;
  /** Set when the guest cancels. The reason is optional. */
  cancellation?: { reason?: CancelReason; at: string };
}

/**
 * Cancellation is arranged by phone with the hotel, which sets its own refund rules (Terms §05).
 * In-app cancel exists only while nothing has been paid (see canCancelInApp). This says which route applies once money has moved.
 */
export type CancelReason = "plans_changed" | "dates_changed" | "found_other" | "mistake" | "other";
export const CANCEL_REASONS: CancelReason[] = ["plans_changed", "dates_changed", "found_other", "mistake", "other"];

/**
 * A guest can cancel in the app while nothing has been paid: a request, or an accepted/overdue booking waiting for the deposit.
 * Once money has moved (confirmed), cancelling and refunds go through the hotel.
 */
export function canCancelInApp(b: Pick<Booking, "status">): boolean {
  return b.status === "pending" || b.status === "accepted" || b.status === "overdue";
}

export type CancellationRoute = "call_hotel" | "not_applicable";

export function cancellationRoute(status: BookingStatus): CancellationRoute {
  return status === "confirmed" ? "call_hotel" : "not_applicable";
}

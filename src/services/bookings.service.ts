import { canTransition, nextStatusesFor, type Booking, type BookingStatus } from "@/domain";
import { MOCK_PAY_WINDOW_MINUTES } from "@/config/booking";
import { createLocalStore } from "./mocks/localStore";

/**
 * MOCK. Bookings are records in this browser's localStorage. There is NO backend, no property,
 * no payment and no notification behind them. The UI labels every one as MOCK.
 */
export const bookingsStore = createLocalStore<Booking[]>("bookings", []);

function makeRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `MOCK-${s}`;
}

export type NewBooking = Omit<Booking, "ref" | "isMock" | "createdAt">;

export function createBooking(input: NewBooking): Booking {
  const booking: Booking = { ...input, ref: makeRef(), isMock: true, createdAt: new Date().toISOString() };
  bookingsStore.set([booking, ...bookingsStore.get()]);
  return booking;
}

export function getBooking(ref: string): Booking | undefined {
  return bookingsStore.get().find((b) => b.ref === ref);
}

/** Applies a status change only if the domain allows it. Returns the updated booking or undefined. */
export function transitionBooking(ref: string, to: BookingStatus): Booking | undefined {
  const all = bookingsStore.get();
  const current = all.find((b) => b.ref === ref);
  if (!current || !canTransition(current.status, to)) return undefined;
  // The hotel accepting an ONLINE booking starts the payment window (MOCK length: see config/booking.ts).
  const payBy = to === "accepted" && current.mode === "online" ? new Date(Date.now() + MOCK_PAY_WINDOW_MINUTES * 60_000).toISOString() : current.payBy;
  const updated = { ...current, status: to, payBy };
  bookingsStore.set(all.map((b) => (b.ref === ref ? updated : b)));
  return updated;
}

export function nextStatuses(b: Booking): BookingStatus[] {
  return nextStatusesFor(b);
}

export function clearMockBookings(): void {
  bookingsStore.set([]);
}

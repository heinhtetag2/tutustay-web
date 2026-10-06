import { addDays, todayIso, type Booking } from "@/domain";

/**
 * DEMO bookings so the "My bookings" tabs aren't empty before a guest has made one. Dates are relative to today.
 * They live in the same store as real mock bookings, so "Clear MOCK bookings" removes them too.
 */
function demo(ref: string, over: Partial<Booking> & Pick<Booking, "status" | "stayId" | "stayName" | "roomId" | "roomName" | "checkIn" | "checkOut">, rate: number, nights: number): Booking {
  const subtotal = rate * nights;
  const platformFee = 1000;
  const total = subtotal + platformFee;
  const mode = over.mode ?? "pay_at_hotel";
  return {
    ref, isMock: true, mode, createdAt: new Date().toISOString(), stayPhone: "+95 9 000 000 001",
    stayType: "overnight", guestType: "local", adults: 2, children: 0, rooms: 1, refundable: true,
    guest: { name: "Demo Guest", phone: "+95 9 000 000 000", email: "demo@example.com", bookingForOther: false },
    price: {
      lines: [{ key: "rate", quantity: nights, unit: "night", amount: subtotal }, { key: "platformFee", amount: platformFee }],
      unitRate: rate, subtotal, discount: 0, platformFee, total,
      payNow: mode === "online" ? total : 0, payAtProperty: mode === "online" ? 0 : total, mode,
    },
    ...over,
  };
}

/** One booking per hotel, spread over the tabs, so the list shows variety (different photos, statuses and prices). */
/** One booking per stay (no repeats), spread over every status the tabs show. */
export function demoBookings(): Booking[] {
  const t = todayIso();
  return [
    demo("MOCK-DEMO01", { status: "confirmed", mode: "online", stayId: "st-06", stayName: "Ngapali Palm Resort", roomId: "st-06-a", roomName: "Palm Garden Room", checkIn: addDays(t, 12), checkOut: addDays(t, 15), adults: 2 }, 150000, 3),
    demo("MOCK-DEMO02", { status: "accepted", mode: "online", payBy: new Date(Date.now() + 24 * 3600_000).toISOString(), stayId: "st-03", stayName: "Golden Bay Retreat", roomId: "st-03-a", roomName: "Garden Bungalow", checkIn: addDays(t, 25), checkOut: addDays(t, 27), adults: 2 }, 120000, 2),
    demo("MOCK-DEMO03", { status: "pending", stayId: "st-04", stayName: "Pinewood Moonlight Camp", roomId: "st-04-a", roomName: "Tent for 2", checkIn: addDays(t, 40), checkOut: addDays(t, 41), adults: 2 }, 30000, 1),
    demo("MOCK-DEMO04", { status: "completed", stayId: "st-01", stayName: "Shwe Pann Hotel", roomId: "st-01-a", roomName: "Standard Double", checkIn: addDays(t, -35), checkOut: addDays(t, -33) }, 45000, 2),
    demo("MOCK-DEMO05", { status: "completed", stayId: "st-07", stayName: "Mandalay Lantern Inn", roomId: "st-07-a", roomName: "Standard Room", checkIn: addDays(t, -70), checkOut: addDays(t, -68), adults: 1 }, 28000, 2),
    demo("MOCK-DEMO06", { status: "cancelled", stayId: "st-02", stayName: "Inya Lakeside Guest House", roomId: "st-02-a", roomName: "Fan Room", checkIn: addDays(t, -20), checkOut: addDays(t, -19), adults: 1 }, 15000, 1),
    demo("MOCK-DEMO07", { status: "rejected", stayId: "st-05", stayName: "Bagan Sunrise Hotel", roomId: "st-05-a", roomName: "Temple View Double", checkIn: addDays(t, -10), checkOut: addDays(t, -8) }, 85000, 2),
  ];
}

export const isDemoBooking = (ref: string) => ref.startsWith("MOCK-DEMO");

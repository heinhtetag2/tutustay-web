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

export function demoBookings(): Booking[] {
  const t = todayIso();
  return [
    demo("MOCK-DEMO01", { status: "confirmed", mode: "online", stayId: "st-01", stayName: "Shwe Pann Hotel", roomId: "st-01-a", roomName: "Standard Double", checkIn: addDays(t, 14), checkOut: addDays(t, 16) }, 45000, 2),
    demo("MOCK-DEMO02", { status: "pending", stayId: "st-06", stayName: "Ngapali Palm Resort", roomId: "st-06-a", roomName: "Palm Garden Room", checkIn: addDays(t, 30), checkOut: addDays(t, 33) }, 150000, 3),
    demo("MOCK-DEMO03", { status: "completed", stayId: "st-05", stayName: "Bagan Sunrise Hotel", roomId: "st-05-a", roomName: "Temple View Double", checkIn: addDays(t, -40), checkOut: addDays(t, -38) }, 85000, 2),
    demo("MOCK-DEMO04", { status: "cancelled", stayId: "st-02", stayName: "Inya Lakeside Guest House", roomId: "st-02-a", roomName: "Fan Room", checkIn: addDays(t, -20), checkOut: addDays(t, -19) }, 15000, 1),
    demo("MOCK-DEMO05", { status: "completed", stayId: "st-02", stayName: "Inya Lakeside Guest House", roomId: "st-02-a", roomName: "Fan Room", checkIn: addDays(t, -75), checkOut: addDays(t, -73) }, 15000, 2),
    demo("MOCK-DEMO06", { status: "rejected", stayId: "st-05", stayName: "Bagan Sunrise Hotel", roomId: "st-05-a", roomName: "Temple View Double", checkIn: addDays(t, -10), checkOut: addDays(t, -8) }, 85000, 2),
  ];
}

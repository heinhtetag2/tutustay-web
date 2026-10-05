import { describe, expect, it } from "vitest";
import {
  addDays, applyCoupon, canTransition, cancellationRoute, computePrice, distanceKm, formatDate, formatDistance, formatKs,
  INITIAL_STATUS, isFinal, nextStatusesFor, isValidStayRange, lowestRate, needsOnlinePayment, nightsBetween, rateFor, ratingLabel,
  type Room, type PricingRules,
} from "./index";

const rules: PricingRules = { platformFee: { pay_at_hotel: 0, online: 1000 } };

const room: Room = {
  id: "r1", name: "Deluxe", bed: "Double", capacity: 2, availableCount: 2, refundable: false, amenities: [],
  rates: {
    overnight: { local: 40000, foreigner: 50000 },
    session: { local: 15000, foreigner: 0 },
    daycation: { local: 0, foreigner: 0 },
  },
};

describe("dates", () => {
  it("counts nights and rejects bad ranges", () => {
    expect(nightsBetween("2026-10-05", "2026-10-08")).toBe(3);
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(isValidStayRange("2026-10-05", "2026-10-06", "2026-10-05")).toBe(true);
    expect(isValidStayRange("2026-10-05", "2026-10-05", "2026-10-05")).toBe(false);
    expect(isValidStayRange("2026-10-04", "2026-10-06", "2026-10-05")).toBe(false);
    expect(isValidStayRange("2026-02-30", "2026-03-02", "2026-01-01")).toBe(false);
  });
  it("uses one display format", () => {
    expect(formatDate("2026-10-05")).toBe("Mon, 5 Oct 2026");
    expect(formatDate("2026-10-05", true)).toBe("5 Oct");
  });
});

describe("rates", () => {
  it("returns the matching rate and never falls back across guest types", () => {
    expect(rateFor(room, "overnight", "local")).toBe(40000);
    expect(rateFor(room, "overnight", "foreigner")).toBe(50000);
    expect(rateFor(room, "session", "foreigner")).toBeNull();
    expect(rateFor(room, "daycation", "local")).toBeNull();
  });
  it("finds the lowest available rate and ignores sold-out rooms", () => {
    const soldOut: Room = { ...room, id: "r2", availableCount: 0, rates: { ...room.rates, overnight: { local: 10000, foreigner: 12000 } } };
    expect(lowestRate([room, soldOut], "overnight", "local")).toBe(40000);
    expect(lowestRate([room], "daycation", "local")).toBeNull();
  });
});

describe("pricing", () => {
  it("multiplies overnight by nights and rooms", () => {
    const p = computePrice({ unitRate: 40000, nights: 2, rooms: 2, stayType: "overnight", mode: "pay_at_hotel", rules });
    expect(p.subtotal).toBe(160000);
    expect(p.total).toBe(160000);
    expect(p.payNow).toBe(0);
    expect(p.payAtProperty).toBe(160000);
  });
  it("prices session and daycation per stay, ignoring nights", () => {
    const p = computePrice({ unitRate: 15000, nights: 3, rooms: 1, stayType: "session", mode: "pay_at_hotel", rules });
    expect(p.subtotal).toBe(15000);
  });
  it("splits an online booking using the stay's own deposit percentage", () => {
    const p30 = computePrice({ unitRate: 40000, nights: 1, rooms: 1, stayType: "overnight", mode: "online", depositPct: 30, rules });
    expect(p30.platformFee).toBe(1000);
    expect(p30.total).toBe(41000);
    expect(p30.payNow).toBe(13000); // 30% of 40,000 = 12,000 + 1,000 fee
    expect(p30.payNow + p30.payAtProperty).toBe(p30.total);
    const p100 = computePrice({ unitRate: 40000, nights: 1, rooms: 1, stayType: "overnight", mode: "online", depositPct: 100, rules });
    expect(p100.payNow).toBe(41000);
    expect(p100.payAtProperty).toBe(0);
  });
  it("applies a discount and never discounts below zero", () => {
    const p = computePrice({ unitRate: 40000, nights: 1, rooms: 1, stayType: "overnight", discount: 999999, mode: "pay_at_hotel", rules });
    expect(p.discount).toBe(40000);
    expect(p.total).toBe(0);
  });
  it("formats Kyat", () => expect(formatKs(40000)).toBe("Ks 40,000"));
});

describe("coupons", () => {
  const c = { code: "WELCOME10", title: "10% off", kind: "percent" as const, value: 10, minSpend: 20000, maxDiscount: 8000, expires: "2026-12-31" };
  it("applies, caps and rejects", () => {
    expect(applyCoupon(c, 40000, "2026-10-05")).toEqual({ ok: true, discount: 4000 });
    expect(applyCoupon(c, 200000, "2026-10-05")).toEqual({ ok: true, discount: 8000 });
    expect(applyCoupon(c, 10000, "2026-10-05")).toEqual({ ok: false, reason: "min_spend" });
    expect(applyCoupon(c, 40000, "2027-01-01")).toEqual({ ok: false, reason: "expired" });
    expect(applyCoupon(undefined, 40000, "2026-10-05")).toEqual({ ok: false, reason: "unknown" });
  });
});

describe("booking lifecycle (Terms §04)", () => {
  it("every booking starts as a pending request", () => expect(INITIAL_STATUS).toBe("pending"));
  it("follows the defined moves", () => {
    expect(canTransition("pending", "accepted")).toBe(true);
    expect(canTransition("pending", "rejected")).toBe(true);
    expect(canTransition("pending", "confirmed")).toBe(false); // nothing is held before the hotel accepts
    expect(canTransition("pending", "cancelled")).toBe(false); // Terms: cancellation applies to accepted, overdue, confirmed
    expect(canTransition("accepted", "confirmed")).toBe(true);
    expect(canTransition("accepted", "overdue")).toBe(true);
    expect(canTransition("overdue", "confirmed")).toBe(true);
  });
  it("rejected, cancelled and completed are final and never come back", () => {
    for (const s of ["rejected", "cancelled", "completed"] as const) {
      expect(isFinal(s)).toBe(true);
      expect(canTransition(s, "pending")).toBe(false);
      expect(canTransition(s, "confirmed")).toBe(false);
    }
  });
  it("cancellation is by phone with the hotel, only once the hotel has accepted", () => {
    expect(cancellationRoute("accepted")).toBe("call_hotel");
    expect(cancellationRoute("overdue")).toBe("call_hotel");
    expect(cancellationRoute("confirmed")).toBe("call_hotel");
    expect(cancellationRoute("pending")).toBe("not_applicable");
    expect(cancellationRoute("completed")).toBe("not_applicable");
  });
  it("asks for online payment only for online stays that are accepted or overdue", () => {
    expect(needsOnlinePayment({ status: "accepted", mode: "online" })).toBe(true);
    expect(needsOnlinePayment({ status: "overdue", mode: "online" })).toBe(true);
    expect(needsOnlinePayment({ status: "accepted", mode: "pay_at_hotel" })).toBe(false);
    expect(needsOnlinePayment({ status: "pending", mode: "online" })).toBe(false);
    expect(needsOnlinePayment({ status: "confirmed", mode: "online" })).toBe(false);
  });
});

describe("mode-aware next statuses", () => {
  it("pay-at-hotel stays skip online-payment stages", () => {
    expect(nextStatusesFor({ status: "accepted", mode: "pay_at_hotel" })).toEqual(["cancelled", "completed"]);
  });
  it("online stays confirm by payment before completing", () => {
    expect(nextStatusesFor({ status: "accepted", mode: "online" })).toEqual(["confirmed", "overdue", "cancelled"]);
    expect(nextStatusesFor({ status: "confirmed", mode: "online" })).toEqual(["cancelled", "completed"]);
  });
});

describe("rating labels", () => {
  it("uses the live score bands", () => {
    expect(ratingLabel(4.8)).toBe("fantastic");
    expect(ratingLabel(4.5)).toBe("fantastic");
    expect(ratingLabel(4.4)).toBe("excellent");
    expect(ratingLabel(3.1)).toBe("comfort");
    expect(ratingLabel(2)).toBe("fair");
    expect(ratingLabel(1.2)).toBe("low");
  });
});

describe("geo", () => {
  it("computes distance and formats it", () => {
    const yangon = { lat: 16.8409, lng: 96.1735 };
    const bagan = { lat: 21.1717, lng: 94.8585 };
    expect(Math.round(distanceKm(yangon, bagan))).toBeGreaterThan(450);
    expect(distanceKm(yangon, yangon)).toBe(0);
    expect(formatDistance(0.4)).toBe("400 m");
    expect(formatDistance(3.26)).toBe("3.3 km");
    expect(formatDistance(42.2)).toBe("42 km");
  });
});

import { canReview } from "./index";
describe("reviews (BR-07)", () => {
  it("only completed bookings can be reviewed, once", () => {
    expect(canReview({ status: "completed" }, false)).toBe(true);
    expect(canReview({ status: "completed" }, true)).toBe(false);
    expect(canReview({ status: "confirmed" }, false)).toBe(false);
    expect(canReview({ status: "cancelled" }, false)).toBe(false);
  });
});

import {
  addDays, distanceKm, lowestRate, nightsBetween, offersStayType, stayTypesOffered, totalGuests,
  type GuestType, type Room, type Stay, type StayType,
} from "@/domain";
import type { SearchParams } from "@/validation/search";
import { fetchAvailableRooms, liveRoomsEnabled } from "./api/rooms.api";
import { applyAvailability, isBlackedOut } from "./mocks/availability";
import { STAYS } from "./mocks/fixtures";

/** Everything in this file is MOCK: it reads fixtures. Swap for real API adapters in phase 6. */
export const IS_MOCK = true;

export interface StaySummary {
  stay: Stay;
  /** Lowest per-unit rate for the active stay type and guest type. Null when not offered. */
  fromRate: number | null;
  available: boolean;
  /** Why it can't be booked right now, when it can't. */
  unavailableReason?: "sold_out" | "stay_type_not_offered";
  offered: StayType[];
  /** Straight-line km from the guest's one-off location reading, when "Stay near you" is on. */
  distanceKm?: number;
}

export interface SearchResult {
  items: StaySummary[];
  /** Stays hidden by filters, so the empty state can say what to relax. */
  total: number;
}

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function matchesPlace(stay: Stay, place: string): boolean {
  if (!place) return true;
  const q = place.toLowerCase();
  return [stay.name, stay.place.region, stay.place.city, stay.place.township ?? ""].some((s) => s.toLowerCase().includes(q));
}

export async function searchStays(p: SearchParams): Promise<SearchResult> {
  await delay();
  const guestType: GuestType = p.foreigner ? "foreigner" : "local";
  const guests = totalGuests(p);
  const me = p.near ? { lat: Number(p.near.split(",")[0]), lng: Number(p.near.split(",")[1]) } : null;

  const items: StaySummary[] = STAYS.filter((s) => matchesPlace(s, p.place))
    .filter((s) => !p.category || s.category === p.category)
    .filter((s) => !p.minRating || (s.rating?.score ?? 0) >= p.minRating)
    .filter((s) => !p.refundable || s.rooms.some((r) => r.refundable))
    .filter((s) => p.facilities.every((f) => s.facilities.includes(f)))
    .filter((s) => {
      if (!p.bounds) return true;
      const [south, west, north, east] = p.bounds.split(",").map(Number) as [number, number, number, number];
      return s.coords.lat >= south && s.coords.lat <= north && s.coords.lng >= west && s.coords.lng <= east;
    })
    .filter((s) => !p.popular || s.popular)
    .filter((s) => !p.coupons || s.couponEligible)
    .filter((s) => p.beds.length === 0 || s.rooms.some((r) => p.beds.includes(r.bed)))
    .filter((s) => p.roomFacilities.every((f) => s.rooms.some((r) => r.amenities.includes(f))))
    .map((stay) => {
      const rooms = applyAvailability(stay.id, stay.rooms, p.checkIn, p.checkOut).filter((r) => r.capacity * p.rooms >= guests);
      const offersType = rooms.some((r) => offersStayType(r, p.stayType));
      const fromRate = offersType ? lowestRate(rooms, p.stayType, guestType) : null;
      const soldOut = isBlackedOut(stay.id, p.checkIn, p.checkOut) || rooms.every((r) => r.availableCount === 0);
      const available = !soldOut && fromRate !== null;
      return {
        stay,
        distanceKm: me ? distanceKm(me, stay.coords) : undefined,
        fromRate,
        available,
        unavailableReason: available ? undefined : !offersType ? ("stay_type_not_offered" as const) : ("sold_out" as const),
        offered: stayTypesOffered(stay.rooms),
      };
    })
    .filter((i) => (p.minPrice === undefined || i.fromRate === null || i.fromRate >= p.minPrice))
    .filter((i) => (p.maxPrice === undefined || i.fromRate === null || i.fromRate <= p.maxPrice));

  const filtered = p.bookable ? items.filter((i) => i.available) : items; // "Reservation available"
  const sorted = [...filtered].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1; // unavailable always last
    if (me && p.sort === "recommended") return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity); // near you: closest first
    switch (p.sort) {
      case "price-asc": return (a.fromRate ?? Infinity) - (b.fromRate ?? Infinity);
      case "price-desc": return (b.fromRate ?? -1) - (a.fromRate ?? -1);
      case "rating": return (b.stay.rating?.score ?? 0) - (a.stay.rating?.score ?? 0);
      default: return (b.stay.rating?.count ?? 0) - (a.stay.rating?.count ?? 0);
    }
  });
  return { items: sorted, total: STAYS.length };
}

export async function getStay(id: string): Promise<Stay | null> {
  await delay(60);
  return STAYS.find((s) => s.id === id) ?? null;
}

export async function getAvailableRooms(
  stayId: string,
  p: Pick<SearchParams, "checkIn" | "checkOut"> & Partial<Pick<SearchParams, "adults" | "children" | "rooms" | "stayType">>,
): Promise<Room[]> {
  // Opt-in live data for rooms only (the one endpoint with an observed contract). Everything else stays mock.
  if (liveRoomsEnabled()) {
    return fetchAvailableRooms(stayId, { adults: 2, children: 0, rooms: 1, stayType: "overnight", ...p });
  }
  await delay(60);
  const stay = STAYS.find((s) => s.id === stayId);
  return stay ? applyAvailability(stay.id, stay.rooms, p.checkIn, p.checkOut) : [];
}

export function listStayIds(): string[] {
  return STAYS.map((s) => s.id);
}

export function listPlaces(): { name: string; count: number; fromRate: number | null; coverStayId: string }[] {
  const byCity = new Map<string, { count: number; from: number | null; cover: Stay }>();
  for (const s of STAYS) {
    const rate = lowestRate(s.rooms, "overnight", "local");
    const cur = byCity.get(s.place.city) ?? { count: 0, from: null, cover: s };
    // The city's photo comes from its best-rated stay.
    const cover = (s.rating?.score ?? 0) > (cur.cover.rating?.score ?? 0) ? s : cur.cover;
    byCity.set(s.place.city, { count: cur.count + 1, cover, from: rate === null ? cur.from : cur.from === null ? rate : Math.min(cur.from, rate) });
  }
  return [...byCity].map(([name, v]) => ({ name, count: v.count, fromRate: v.from, coverStayId: v.cover.id }));
}

export async function listFeatured(limit = 6): Promise<Stay[]> {
  await delay(60);
  return [...STAYS].sort((a, b) => (b.rating?.score ?? 0) - (a.rating?.score ?? 0)).slice(0, limit);
}

/** MOCK helper for the "unavailable" recovery path: the first start date (within 60 days) that has rooms. */
export async function findNextAvailableStart(
  stayId: string,
  p: Pick<SearchParams, "checkIn" | "checkOut">,
): Promise<string | null> {
  const stay = STAYS.find((s) => s.id === stayId);
  if (!stay) return null;
  const length = Math.max(1, nightsBetween(p.checkIn, p.checkOut));
  for (let i = 1; i <= 60; i++) {
    const start = addDays(p.checkIn, i);
    if (!isBlackedOut(stayId, start, addDays(start, length))) return start;
  }
  return null;
}


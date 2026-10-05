export type StayType = "overnight" | "session" | "daycation";
export type GuestType = "local" | "foreigner";

export const STAY_TYPES: StayType[] = ["overnight", "session", "daycation"];
export const SESSION_HOURS = [3, 6, 9, 12] as const;
export type SessionHours = (typeof SESSION_HOURS)[number];

/** Whole-Kyat rate. 0 means "not offered for this combination" (mirrors the live API). */
export interface RatePair {
  local: number;
  foreigner: number;
}

export interface Room {
  id: string;
  name: string;
  bed: string;
  capacity: number;
  availableCount: number;
  rates: Record<StayType, RatePair>;
  refundable: boolean;
  amenities: string[];
}

/** The rate that applies to a stay type and guest type, or null when the room doesn't offer it. */
export function rateFor(room: Room, stayType: StayType, guestType: GuestType): number | null {
  const rate = room.rates[stayType][guestType];
  if (rate > 0) return rate;
  // A missing foreigner rate must never silently fall back to the local rate: surface it.
  return null;
}

export function offersStayType(room: Room, stayType: StayType): boolean {
  return room.rates[stayType].local > 0 || room.rates[stayType].foreigner > 0;
}

export function stayTypesOffered(rooms: Room[]): StayType[] {
  return STAY_TYPES.filter((t) => rooms.some((r) => offersStayType(r, t)));
}

/** Lowest rate across rooms for a stay type and guest type, or null if none are offered. */
export function lowestRate(rooms: Room[], stayType: StayType, guestType: GuestType): number | null {
  const rates = rooms
    .filter((r) => r.availableCount > 0)
    .map((r) => rateFor(r, stayType, guestType))
    .filter((n): n is number => n !== null);
  return rates.length ? Math.min(...rates) : null;
}

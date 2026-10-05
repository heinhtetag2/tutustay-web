import type { Room } from "@/domain";
import { nightsBetween } from "@/domain";
import { BLACKOUTS } from "./fixtures";

/** MOCK availability: blackout windows zero out every room, nothing else is date-aware. */
export function isBlackedOut(stayId: string, checkIn: string, checkOut: string): boolean {
  const windows = BLACKOUTS[stayId] ?? [];
  const lastNight = nightsBetween(checkIn, checkOut) >= 1 ? checkOut : checkIn;
  return windows.some((w) => checkIn <= w.to && lastNight >= w.from);
}

export function applyAvailability(stayId: string, rooms: Room[], checkIn: string, checkOut: string): Room[] {
  return isBlackedOut(stayId, checkIn, checkOut) ? rooms.map((r) => ({ ...r, availableCount: 0 })) : rooms;
}

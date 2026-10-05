export interface GuestCounts {
  adults: number;
  children: number;
  rooms: number;
}

export const LIMITS = { adults: { min: 1, max: 12 }, children: { min: 0, max: 8 }, rooms: { min: 1, max: 6 } } as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function totalGuests(g: GuestCounts): number {
  return g.adults + g.children;
}

/** Plain-English summary that is also the single source for the "guests" display everywhere. */
export function guestSummary(g: GuestCounts): string {
  const n = totalGuests(g);
  return `${n} guest${n === 1 ? "" : "s"} · ${g.rooms} room${g.rooms === 1 ? "" : "s"}`;
}

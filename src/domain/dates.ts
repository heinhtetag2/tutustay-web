/** Dates travel as ISO `YYYY-MM-DD` strings. No timezone maths: a stay date is a calendar date. */

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export function isIsoDate(value: string): boolean {
  if (!ISO.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayIso(now: Date = new Date()): string {
  // Local calendar date, not UTC, so "today" is what the user sees on their clock.
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  return toIso(new Date(new Date(`${iso}T00:00:00Z`).getTime() + days * DAY_MS));
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = new Date(`${checkOut}T00:00:00Z`).getTime() - new Date(`${checkIn}T00:00:00Z`).getTime();
  return Math.round(diff / DAY_MS);
}

export function isValidStayRange(checkIn: string, checkOut: string, today: string): boolean {
  return isIsoDate(checkIn) && isIsoDate(checkOut) && checkIn >= today && nightsBetween(checkIn, checkOut) >= 1;
}

/** One display format across the product: `Mon, 5 Oct 2026` (long) or `5 Oct` (compact). */
export function formatDate(iso: string, compact = false): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    ...(compact ? { day: "numeric", month: "short" } : { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
  }).format(d);
}

import type { StayType } from "./room";

/** The hours a session or daycation covers. Overnight stays use the hotel's check-in and check-out times instead. */
export interface StayWindow { start: string; end: string; /** The end falls on the next day (a session that runs past midnight). */ nextDay: boolean }

export interface WindowPolicies { checkIn: string; checkOut: string; sessionStart: string; daycationStart?: string; daycationEnd?: string }

const DEFAULT_DAYCATION = { start: "09:00", end: "17:00" } as const;

const toMinutes = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number) as [number, number]; return h * 60 + m; };
const toHhmm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Start times a guest can pick for a session: every hour from the hotel's first session start, as late as the session can still begin the same evening. */
export function sessionStartOptions(policies: Pick<WindowPolicies, "sessionStart">, hours: number): string[] {
  const first = Math.floor(toMinutes(policies.sessionStart) / 60);
  const last = Math.max(first, 22);
  return Array.from({ length: last - first + 1 }, (_, i) => `${String(first + i).padStart(2, "0")}:00`).filter((s) => toMinutes(s) + hours * 60 <= 36 * 60);
}

/** Start and end times a guest can pick for a daycation: hourly inside the hotel's daytime hours. Ends are always later than the chosen start. */
export function daycationOptions(policies: Pick<WindowPolicies, "daycationStart" | "daycationEnd">, startTime?: string): { starts: string[]; ends: string[] } {
  const from = Math.floor(toMinutes(policies.daycationStart ?? DEFAULT_DAYCATION.start) / 60);
  const to = Math.floor(toMinutes(policies.daycationEnd ?? DEFAULT_DAYCATION.end) / 60);
  const hour = (h: number) => `${String(h).padStart(2, "0")}:00`;
  const starts = Array.from({ length: Math.max(1, to - from) }, (_, i) => hour(from + i));
  const startH = startTime ? Math.floor(toMinutes(startTime) / 60) : from;
  const ends = Array.from({ length: Math.max(1, to - startH) }, (_, i) => hour(startH + 1 + i)).filter((e) => toMinutes(e) <= to * 60 || e === hour(startH + 1));
  return { starts, ends };
}

/**
 * Start and end of a session or daycation. A session starts when the guest picks (the hotel's first start by default) and runs for its length.
 * A daycation starts and ends when the guest picks, inside the hotel's daytime hours. Returns null for overnight stays.
 */
export function stayWindow(stayType: StayType, policies: WindowPolicies, startTime?: string, sessionHours = 3, endTime?: string): StayWindow | null {
  if (stayType === "overnight") return null;
  if (stayType === "daycation") {
    const { starts, ends } = daycationOptions(policies, startTime);
    const start = startTime && starts.includes(startTime) ? startTime : starts[0]!;
    const picked = daycationOptions(policies, start).ends;
    const end = endTime && picked.includes(endTime) ? endTime : picked[picked.length - 1]!;
    return { start, end, nextDay: false };
  }
  const start = startTime && /^\d{2}:\d{2}$/.test(startTime) ? startTime : policies.sessionStart;
  const endMin = toMinutes(start) + sessionHours * 60;
  return { start, end: toHhmm(endMin), nextDay: endMin >= 24 * 60 };
}

/** Times to offer before a property is chosen (the search screens). Each hotel's own hours replace these on its pages. */
export const DEFAULT_WINDOW_POLICIES: WindowPolicies = { checkIn: "14:00", checkOut: "12:00", sessionStart: "09:00" };

import type { Stay } from "@/domain";
import { STAYS } from "./fixtures";

/** Client-safe sync lookup (mock fixtures). Kept apart from stays.service so no server-only code reaches the browser bundle. */
export function findStaysByIds(ids: string[]): Stay[] {
  return STAYS.filter((s) => ids.includes(s.id));
}

/** The cities that have stays, for place suggestions in client components (same list the search page offers). */
export function listPlaceNames(): string[] {
  return [...new Set(STAYS.map((s) => s.place.city))];
}

import type { Stay } from "@/domain";
import { STAYS } from "./fixtures";

/** Client-safe sync lookup (mock fixtures). Kept apart from stays.service so no server-only code reaches the browser bundle. */
export function findStaysByIds(ids: string[]): Stay[] {
  return STAYS.filter((s) => ids.includes(s.id));
}

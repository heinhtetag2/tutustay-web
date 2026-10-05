import type { TFunction } from "@/i18n/translate";

/** "2 guests · 1 room": the single source for the guests display, with correct singular/plural. */
export function guestSummaryText(t: TFunction, guests: number, rooms: number): string {
  const g = guests === 1 ? t("guests.guestOne") : t("guests.guestMany", { n: guests });
  const r = rooms === 1 ? t("guests.roomOne") : t("guests.roomMany", { rooms });
  return `${g} · ${r}`;
}

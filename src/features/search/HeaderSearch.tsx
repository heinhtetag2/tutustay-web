"use client";

import { useSearchParams } from "next/navigation";
import { todayIso } from "@/domain";
import { listPlaceNames } from "@/services/mocks/staysLookup";
import { parseSearchParams } from "@/validation/search";
import { SearchBar } from "./SearchBar";

/**
 * The search pill in the top bar on wide screens (results page). It reads the current search from the address, so it always
 * shows what you searched; changing it and pressing the round button runs a new search with the same filters kept.
 */
export function HeaderSearch() {
  const sp = useSearchParams();
  const record: Record<string, string | string[]> = {};
  for (const k of new Set(sp.keys())) { const all = sp.getAll(k); record[k] = all.length > 1 ? all : all[0]!; }
  const today = todayIso();
  const { params: p } = parseSearchParams(record, today);
  const preserve = { near: p.near, view: p.view, popular: p.popular, bookable: p.bookable, coupons: p.coupons, beds: p.beds, roomFacilities: p.roomFacilities, category: p.category, minPrice: p.minPrice, maxPrice: p.maxPrice, minRating: p.minRating, refundable: p.refundable, facilities: p.facilities, sort: p.sort };
  return (
    <SearchBar
      key={sp.toString()} variant="header" today={today} placeOptions={listPlaceNames()}
      initial={{ place: p.place, checkIn: p.checkIn, checkOut: p.checkOut, adults: p.adults, children: p.children, rooms: p.rooms, stayType: p.stayType, sessionHours: p.sessionHours, foreigner: p.foreigner }}
      preserve={preserve}
    />
  );
}

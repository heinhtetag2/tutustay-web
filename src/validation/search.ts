import { z } from "zod";
import { addDays, isValidStayRange, SESSION_HOURS, STAY_TYPES, todayIso, type SessionHours, type StayType } from "@/domain";
import type { PropertyCategory } from "@/domain";

export const SORTS = ["recommended", "price-asc", "price-desc", "rating"] as const;
export type Sort = (typeof SORTS)[number];
const CATEGORIES: PropertyCategory[] = ["hotel", "motel", "resort", "campsite"];

export interface SearchParams {
  place: string;
  category?: PropertyCategory;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  stayType: StayType;
  sessionHours: SessionHours;
  /** "Guest from outside Myanmar": selects the foreigner rate (rules for mixed parties: Q5). */
  foreigner: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  refundable: boolean;
  facilities: string[];
  /** Room facilities, bed types and the three quick filters seen on the live site. */
  roomFacilities: string[];
  beds: string[];
  popular: boolean;
  bookable: boolean;
  coupons: boolean;
  /** "Stay near you": a single device reading, e.g. "16.8,96.1". Never stored. */
  near?: string;
  /** `list` and `grid` are layouts of the results. `map` is the full-screen map with the list beside it. */
  view: "list" | "grid" | "map" | "split";
  /** "Search on map": south,west,north,east of the visible map. Only set while "update results when map moves" is on. */
  bounds?: string;
  sort: Sort;
}

const int = (min: number, max: number, fallback: number) =>
  z.coerce.number().int().min(min).max(max).catch(fallback);

const bool = z.preprocess((v) => v === "1" || v === "true" || v === true, z.boolean());

const optionalNumber = z.preprocess(
  (v) => (v === undefined || v === "" ? undefined : Number(v)),
  z.number().min(0).max(5).optional().catch(undefined),
);

const csv = z.preprocess((v) => (typeof v === "string" && v ? v.split(",") : []), z.array(z.string())).catch([]);

const optionalInt = z.preprocess(
  (v) => (v === undefined || v === "" ? undefined : Number(v)),
  z.number().int().nonnegative().optional().catch(undefined),
);

const schema = z.object({
  place: z.string().trim().max(80).catch(""),
  category: z.enum(CATEGORIES as [PropertyCategory, ...PropertyCategory[]]).optional().catch(undefined),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  adults: int(1, 12, 2),
  children: int(0, 8, 0),
  rooms: int(1, 6, 1),
  stayType: z.enum(STAY_TYPES as [StayType, ...StayType[]]).catch("overnight"),
  sessionHours: z.coerce.number().refine((n) => (SESSION_HOURS as readonly number[]).includes(n)).catch(3),
  foreigner: bool.catch(false),
  minPrice: optionalInt,
  maxPrice: optionalInt,
  minRating: optionalNumber,
  refundable: bool.catch(false),
  facilities: csv,
  roomFacilities: csv,
  beds: csv,
  popular: bool.catch(false),
  bookable: bool.catch(false),
  coupons: bool.catch(false),
  near: z.string().regex(/^-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/).optional().catch(undefined),
  view: z.preprocess((x) => (x === "cards" ? "grid" : x), z.enum(["list", "grid", "map", "split"])).catch("split"),
  bounds: z.string().regex(/^-?\d{1,3}(\.\d+)?(,-?\d{1,3}(\.\d+)?){3}$/).optional().catch(undefined),
  sort: z.enum(SORTS).catch("recommended"),
});

type Raw = Record<string, string | string[] | undefined>;

export interface ParsedSearch {
  params: SearchParams;
  /** Set when the incoming dates were invalid and were repaired. Surface this to the user. */
  datesRepaired: boolean;
}

/** One place to parse and repair search state from the URL. Never throws. */
export function parseSearchParams(raw: Raw, today: string = todayIso()): ParsedSearch {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(raw)) flat[k] = Array.isArray(v) ? v[0] : v;
  const parsed = schema.parse(flat);

  let { checkIn, checkOut } = parsed;
  let datesRepaired = false;
  if (!checkIn || !checkOut || !isValidStayRange(checkIn, checkOut, today)) {
    // Absent dates are a normal default. Present-but-invalid dates are a repair worth telling the user about.
    datesRepaired = Boolean(flat.checkIn || flat.checkOut);
    checkIn = today;
    checkOut = addDays(today, 1);
  }
  return { params: { ...parsed, checkIn, checkOut, sessionHours: parsed.sessionHours as SessionHours } as SearchParams, datesRepaired };
}

const DEFAULTS = { adults: 2, children: 0, rooms: 1, stayType: "overnight", sessionHours: 3, sort: "recommended" } as const;

/** Serialise to a query string, omitting defaults so URLs stay short and shareable. */
export function toQueryString(p: Partial<SearchParams>): string {
  const q = new URLSearchParams();
  const set = (k: string, v: unknown) => { if (v !== undefined && v !== "" && v !== false) q.set(k, v === true ? "1" : String(v)); };
  set("place", p.place);
  set("category", p.category);
  set("checkIn", p.checkIn);
  set("checkOut", p.checkOut);
  if (p.adults !== undefined && p.adults !== DEFAULTS.adults) set("adults", p.adults);
  if (p.children !== undefined && p.children !== DEFAULTS.children) set("children", p.children);
  if (p.rooms !== undefined && p.rooms !== DEFAULTS.rooms) set("rooms", p.rooms);
  if (p.stayType && p.stayType !== DEFAULTS.stayType) set("stayType", p.stayType);
  if (p.stayType === "session" && p.sessionHours && p.sessionHours !== DEFAULTS.sessionHours) set("sessionHours", p.sessionHours);
  set("foreigner", p.foreigner);
  set("minPrice", p.minPrice);
  set("maxPrice", p.maxPrice);
  set("minRating", p.minRating);
  set("refundable", p.refundable);
  if (p.facilities?.length) set("facilities", p.facilities.join(","));
  if (p.roomFacilities?.length) set("roomFacilities", p.roomFacilities.join(","));
  if (p.beds?.length) set("beds", p.beds.join(","));
  set("popular", p.popular);
  set("bookable", p.bookable);
  set("coupons", p.coupons);
  set("near", p.near);
  if (p.view && p.view !== "split") set("view", p.view); // list beside a map is the default
  if (p.view === "map") set("bounds", p.bounds);
  if (p.sort && p.sort !== DEFAULTS.sort) set("sort", p.sort);
  return q.toString();
}

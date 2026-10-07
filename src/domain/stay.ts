import type { PaymentMode } from "./pricing";
import type { LatLng } from "./geo";
import type { Room } from "./room";

export type PropertyCategory = "hotel" | "motel" | "resort" | "campsite";

export const CATEGORY_LABEL: Record<PropertyCategory, string> = {
  hotel: "Hotel",
  motel: "Motel / Guest house",
  resort: "Resort",
  campsite: "Campsite",
};

export interface Stay {
  id: string;
  name: string;
  category: PropertyCategory;
  /** Region > city > township. The live site has only free-text names (open question Q6). */
  place: { region: string; city: string; township?: string };
  coords: LatLng;
  summary: string;
  /** Longer description for the About section, one string per paragraph. Falls back to `summary`. */
  about?: string[];
  rating: { score: number; count: number } | null;
  facilities: string[];
  popular: boolean;
  /** Participates in a coupon offer (Terms §06: "whether the hotel participates"). */
  couponEligible: boolean;
  /** Set per stay (Terms §06). `depositPct` applies to `online` only and varies by hotel (FAQ). */
  payment: { mode: PaymentMode; depositPct?: number };
  policies: {
    checkIn: string;
    checkOut: string;
    breakfast: "free" | "paid" | "none";
    sessionStart: string;
    /** Session lengths are set BY THE HOTEL (Terms §04). */
    sessionHours: number[];
  };
  /** Mock number. The Terms say the app shows the hotel's number, since cancellation is by phone. */
  phone: string;
  rooms: Room[];
}

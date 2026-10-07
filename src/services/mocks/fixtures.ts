/**
 * MOCK DATA. Every stay, room, rate, coupon and review here is invented for the low-fidelity
 * foundation. None of it comes from TutuStay's backend. Names are fictional.
 */
import type { Coupon, Room, Stay } from "@/domain";

type Pair = [number, number];
const room = (
  id: string, name: string, bed: string, capacity: number, availableCount: number,
  overnight: Pair, session: Pair, daycation: Pair, refundable: boolean, amenities: string[],
): Room => ({
  id, name, bed, capacity, availableCount, refundable, amenities,
  rates: {
    overnight: { local: overnight[0], foreigner: overnight[1] },
    session: { local: session[0], foreigner: session[1] },
    daycation: { local: daycation[0], foreigner: daycation[1] },
  },
});
const NONE: Pair = [0, 0];

type RawStay = Omit<Stay, "coords" | "popular" | "couponEligible" | "payment" | "policies"> & { policies: Omit<Stay["policies"], "sessionHours"> };
const RAW_STAYS: RawStay[] = [
  {
    id: "st-01", name: "Shwe Pann Hotel", category: "hotel",
    place: { region: "Yangon", city: "Yangon", township: "Sanchaung" },
    summary: "Mock listing. A mid-range city hotel near the Sanchaung food streets with a quiet rooftop.",
    about: ["Shwe Pann Hotel is a comfortable mid-range hotel in Sanchaung, one of Yangon's liveliest neighbourhoods. Step outside and you are a short walk from tea shops, street-food stalls and local markets, with downtown and the major pagodas a quick taxi ride away.", "Rooms are clean, quiet and air-conditioned, with fast WiFi for work or streaming. Up on the rooftop you can unwind with a drink and a view over the city, and the 24-hour front desk is happy to help with airport transfers, taxis and local tips.", "It suits couples, solo travellers and business guests who want a central base without the price of a big-name hotel."],
    rating: { score: 4.6, count: 128 },
    facilities: ["WiFi", "AC", "24 Hour Front Desk", "Airport Shuttle", "Cafe"],
    policies: { checkIn: "14:00", checkOut: "12:00", breakfast: "free", sessionStart: "14:00" },
    phone: "+95 9 000 000 001",
    rooms: [
      room("st-01-a", "Standard Double", "Double", 2, 3, [45000, 60000], [18000, 24000], [25000, 32000], false, ["AC", "WiFi", "Electric kettle"]),
      room("st-01-b", "Deluxe Twin", "Twin", 3, 2, [60000, 78000], [24000, 30000], NONE, true, ["AC", "WiFi", "Daily Housekeeping"]),
      room("st-01-c", "Family Suite", "Queen", 4, 1, [95000, 120000], NONE, NONE, true, ["AC", "WiFi", "Bathtub"]),
    ],
  },
  {
    id: "st-02", name: "Inya Lakeside Guest House", category: "motel",
    place: { region: "Yangon", city: "Yangon", township: "Hlaing" },
    summary: "Mock listing. A simple guest house with fan and AC rooms, 10 minutes from the lake.",
    about: ["Inya Lakeside Guest House is a simple, friendly place to stay in Hlaing, about ten minutes from Inya Lake. It is a good fit for travellers who want a clean bed, a hot shower and a warm welcome at an honest price.", "Choose between fan rooms and air-conditioned rooms, all with WiFi. The front desk is open around the clock, so late arrivals are no problem, and the staff can point you to the best local restaurants and the easiest way into the city.", "Families, backpackers and longer-stay guests like the relaxed feel and the easy access to the lake for an evening walk."],
    rating: { score: 4.1, count: 41 },
    facilities: ["WiFi", "Fan", "24 Hour Front Desk"],
    policies: { checkIn: "13:00", checkOut: "11:00", breakfast: "none", sessionStart: "13:00" },
    phone: "+95 9 000 000 002",
    rooms: [
      room("st-02-a", "Fan Room", "Single", 1, 4, [15000, 22000], [7000, 10000], [10000, 14000], false, ["Fan"]),
      room("st-02-b", "AC Double", "Double", 2, 2, [25000, 35000], [10000, 14000], [14000, 19000], false, ["AC", "WiFi"]),
    ],
  },
  {
    id: "st-03", name: "Golden Bay Retreat", category: "resort",
    place: { region: "Ayeyarwady", city: "Pathein", township: "Ngwe Saung" },
    summary: "Mock listing. A beachfront resort with a pool and a restaurant on the sand.",
    about: ["Golden Bay Retreat sits right on the sand at Ngwe Saung, one of Myanmar's most loved beaches. Wake up to the sound of the waves, have breakfast with the sea in front of you and spend the day between the pool and the shoreline.", "The resort has air-conditioned rooms, a swimming pool, a spa and wellness centre, and a restaurant that serves fresh seafood and local favourites on the beach. An airport shuttle can be arranged to make the trip from Yangon easy.", "It is a relaxed choice for couples, families and friends looking for a proper beach break."],
    rating: { score: 4.8, count: 212 },
    facilities: ["WiFi", "AC", "Swimming Pool", "Spa & Wellness Centre", "Airport Shuttle", "Cafe"],
    policies: { checkIn: "14:00", checkOut: "12:00", breakfast: "free", sessionStart: "14:00" },
    phone: "+95 9 000 000 003",
    rooms: [
      room("st-03-a", "Garden Bungalow", "Queen", 2, 5, [120000, 160000], NONE, [60000, 80000], true, ["AC", "WiFi", "Balcony"]),
      room("st-03-b", "Beachfront Villa", "King", 4, 2, [220000, 280000], NONE, [110000, 140000], true, ["AC", "WiFi", "Private pool"]),
    ],
  },
  {
    id: "st-04", name: "Pinewood Moonlight Camp", category: "campsite",
    place: { region: "Shan", city: "Nyaungshwe", township: "Inle Lake" },
    summary: "Mock listing. Tent pitches and cabins among pine trees, with a campfire area.",
    about: ["Pinewood Moonlight Camp is a peaceful campsite in the hills by Inle Lake, with tent pitches and cabins set among tall pine trees. Evenings are spent around the campfire, and mornings start with cool, fresh mountain air.", "There is WiFi near the main area and a small cafe serving hot drinks and simple meals. The camp is a good base for boat trips on the lake, cycling to nearby villages and visits to the local markets.", "It is ideal for nature lovers, small groups and anyone who wants a quiet night under the stars without giving up the basics."],
    rating: { score: 4.4, count: 63 },
    facilities: ["Campfire Area", "WiFi", "Cafe"],
    policies: { checkIn: "15:00", checkOut: "11:00", breakfast: "paid", sessionStart: "15:00" },
    phone: "+95 9 000 000 004",
    rooms: [
      room("st-04-a", "Tent for 2", "Double", 2, 6, [30000, 42000], NONE, [18000, 24000], false, ["Fan"]),
      room("st-04-b", "Pine Cabin", "Queen", 3, 2, [65000, 85000], NONE, NONE, true, ["AC", "WiFi"]),
    ],
  },
  {
    id: "st-05", name: "Bagan Sunrise Hotel", category: "hotel",
    place: { region: "Mandalay", city: "Bagan", township: "Nyaung-U" },
    summary: "Mock listing. Temple-view rooms and a terrace made for sunrise.",
    about: ["Bagan Sunrise Hotel is in Nyaung-U, just minutes from the temples of Bagan. Many rooms look out over the temple plains, and the terrace is made for sunrise: bring a coffee, find a seat and watch the sky turn gold over the pagodas.", "Rooms are air-conditioned with WiFi, and the hotel has a swimming pool for cooling off after a day of exploring, a cafe, and a 24-hour front desk that can arrange e-bikes, horse carts and balloon bookings.", "It is a good pick for couples and first-time visitors who want to be close to the sights."],
    rating: { score: 4.7, count: 301 },
    facilities: ["WiFi", "AC", "Swimming Pool", "24 Hour Front Desk", "Cafe"],
    policies: { checkIn: "14:00", checkOut: "12:00", breakfast: "free", sessionStart: "14:00" },
    phone: "+95 9 000 000 005",
    rooms: [
      room("st-05-a", "Temple View Double", "Double", 2, 4, [85000, 110000], [34000, 44000], [48000, 62000], true, ["AC", "WiFi", "Balcony"]),
      room("st-05-b", "Superior King", "King", 2, 2, [105000, 135000], NONE, NONE, true, ["AC", "WiFi"]),
    ],
  },
  {
    id: "st-06", name: "Ngapali Palm Resort", category: "resort",
    place: { region: "Rakhine", city: "Thandwe", township: "Ngapali" },
    summary: "Mock listing. Sold out over the Christmas window to demonstrate the unavailable state.",
    about: ["Ngapali Palm Resort stands among coconut palms on the white sand of Ngapali, on Rakhine's coast. The beach is a few steps from your door, and the water is calm and clear for most of the year.", "Guests have air-conditioned rooms, WiFi, a swimming pool and a spa and wellness centre, with an airport shuttle to meet flights at Thandwe. Dinner on the sand, with grilled fish and a sea breeze, is a favourite.", "It suits honeymooners and families who want a slow, restful holiday by the sea."],
    rating: { score: 4.9, count: 154 },
    facilities: ["WiFi", "AC", "Swimming Pool", "Spa & Wellness Centre", "Airport Shuttle"],
    policies: { checkIn: "14:00", checkOut: "12:00", breakfast: "free", sessionStart: "14:00" },
    phone: "+95 9 000 000 006",
    rooms: [
      room("st-06-a", "Palm Garden Room", "Queen", 2, 3, [150000, 195000], NONE, [75000, 98000], true, ["AC", "WiFi"]),
    ],
  },
  {
    id: "st-07", name: "Mandalay Lantern Inn", category: "motel",
    place: { region: "Mandalay", city: "Mandalay", township: "Chanayethazan" },
    summary: "Mock listing. Overnight stays only: no session or daycation rates are offered here.",
    about: ["Mandalay Lantern Inn is a small, welcoming inn in Chanayethazan, close to Mandalay's old city and its busy markets. It is a simple base for visiting the palace, the monasteries and the hills around town.", "Each room is air-conditioned and has WiFi. The inn offers overnight stays only, so it works best for travellers passing through or spending a night or two in the city.", "The owners know the area well and are happy to help with transport and plans for the next day."],
    rating: null,
    facilities: ["WiFi", "AC"],
    policies: { checkIn: "14:00", checkOut: "12:00", breakfast: "none", sessionStart: "14:00" },
    phone: "+95 9 000 000 007",
    rooms: [
      room("st-07-a", "Standard Room", "Double", 2, 5, [28000, 38000], NONE, NONE, false, ["AC", "WiFi"]),
    ],
  },
  {
    id: "st-08", name: "Hlaing River Hotel", category: "hotel",
    place: { region: "Yangon", city: "Yangon", township: "Insein" },
    summary: "Mock listing. A business hotel with short-stay sessions popular with day visitors.",
    about: ["Hlaing River Hotel is a practical business hotel in Insein, on the northern side of Yangon. It is popular with visitors who need a quiet room for a few hours or a night, so short stay sessions are available as well as overnight stays.", "Rooms are air-conditioned, with WiFi and a desk for work, and the front desk is open 24 hours. The hotel is easy to reach from the airport and the main roads north of the city.", "It is a good fit for business travellers, day visitors and anyone who needs a clean, comfortable room at a fair price."],
    rating: { score: 3.9, count: 27 },
    facilities: ["WiFi", "AC", "24 Hour Front Desk"],
    policies: { checkIn: "14:00", checkOut: "12:00", breakfast: "paid", sessionStart: "14:00" },
    phone: "+95 9 000 000 008",
    rooms: [
      room("st-08-a", "Economy Room", "Single", 1, 4, [32000, 44000], [13000, 18000], [18000, 24000], false, ["AC"]),
      room("st-08-b", "Business Double", "Double", 2, 3, [48000, 62000], [19000, 25000], [26000, 34000], false, ["AC", "WiFi", "Desk"]),
    ],
  },
];

/** Per-stay facts added to the raw fixtures: payment mode (Terms §06), location, flags, hotel-set session lengths. */
const META: Record<string, Pick<Stay, "coords" | "popular" | "couponEligible" | "payment"> & { sessionHours: number[] }> = {
  "st-01": { coords: { lat: 16.8, lng: 96.13 }, popular: true, couponEligible: true, payment: { mode: "online", depositPct: 30 }, sessionHours: [3, 6, 9, 12] },
  "st-02": { coords: { lat: 16.88, lng: 96.12 }, popular: false, couponEligible: true, payment: { mode: "pay_at_hotel" }, sessionHours: [3, 6] },
  "st-03": { coords: { lat: 16.853, lng: 94.396 }, popular: true, couponEligible: false, payment: { mode: "online", depositPct: 50 }, sessionHours: [] },
  "st-04": { coords: { lat: 20.66, lng: 96.93 }, popular: false, couponEligible: false, payment: { mode: "pay_at_hotel" }, sessionHours: [] },
  "st-05": { coords: { lat: 21.2015, lng: 94.914 }, popular: true, couponEligible: true, payment: { mode: "online", depositPct: 100 }, sessionHours: [3, 6, 12] },
  "st-06": { coords: { lat: 18.4135, lng: 94.299 }, popular: true, couponEligible: false, payment: { mode: "online", depositPct: 30 }, sessionHours: [] },
  "st-07": { coords: { lat: 21.98, lng: 96.08 }, popular: false, couponEligible: true, payment: { mode: "pay_at_hotel" }, sessionHours: [] },
  "st-08": { coords: { lat: 16.9, lng: 96.1 }, popular: false, couponEligible: false, payment: { mode: "pay_at_hotel" }, sessionHours: [3, 6, 9, 12] },
};

export const STAYS: Stay[] = RAW_STAYS.map((s) => {
  const { sessionHours, ...meta } = META[s.id]!;
  return { ...s, ...meta, policies: { ...s.policies, sessionHours } } as Stay;
});

export const COUPONS: Coupon[] = [
  { code: "WELCOME10", title: "10% off your first stay", kind: "percent", value: 10, minSpend: 20000, maxDiscount: 15000, expires: "2026-12-31" },
  { code: "TUTU5000", title: "Ks 5,000 off", kind: "fixed", value: 5000, minSpend: 40000, expires: "2026-11-30" },
  { code: "OLDDEAL", title: "Expired example", kind: "fixed", value: 3000, expires: "2026-01-31" },
];

/** Dates (inclusive) on which st-06 has no rooms: demonstrates the "unavailable" state. */
export const BLACKOUTS: Record<string, { from: string; to: string }[]> = {
  "st-06": [{ from: "2026-12-20", to: "2026-12-31" }],
};

export const REVIEWS: Record<string, { author: string; score: number; text: string; stayed: string }[]> = {
  "st-01": [
    { author: "Mock reviewer A", score: 5, text: "Clean room, friendly desk, easy to find. (MOCK review)", stayed: "Sep 2026" },
    { author: "Mock reviewer B", score: 4, text: "Good value for Sanchaung. Rooftop was quiet. (MOCK review)", stayed: "Aug 2026" },
  ],
};

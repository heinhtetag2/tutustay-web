import type { Stay } from "@/domain";

/**
 * DEMO review data, generated from each stay's own score so the numbers stay consistent with its rating
 * (distribution, category scores, topic counts, a few review cards). Deterministic: the same stay always gets the same data.
 * Replace with real review data when a backend exists.
 */
export type RvKey = "cleanliness" | "staff" | "location" | "value" | "comfort" | "checkin";
export type TopicKey = "cleanliness" | "staff" | "location" | "value" | "comfort" | "breakfast" | "quiet" | "view";

export interface ReviewSummary {
  /** Share of reviews per star (0–100), index 0 = 5 stars. Sums to 100. */
  distribution: number[];
  categories: { key: RvKey; score: number }[];
  topics: { key: TopicKey; count: number }[];
  cards: { author: string; avatar: string; topics: TopicKey[]; score: number; when: string; text: string }[];
}

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Demo guest portraits in /public/demo/avatars (Unsplash); replace with real guest photos when a backend exists. */
const NAMES: [string, string][] = [["Aung K.", "/demo/avatars/1507003211169-0a1dd7228f2d.jpg"], ["Thida M.", "/demo/avatars/1494790108377-be9c29b29330.jpg"], ["Min S.", "/demo/avatars/1500648767791-00dcc994a43e.jpg"], ["Nandar L.", "/demo/avatars/1438761681033-6461ffad8d80.jpg"], ["Kyaw Z.", "/demo/avatars/1506794778202-cad84cf45f1d.jpg"], ["Su Su", "/demo/avatars/1544005313-94ddf0286df2.jpg"]];
const WHEN = ["2 weeks ago", "September 2026", "August 2026", "August 2026", "July 2026", "June 2026"];

const TEXT: Record<Stay["category"], string[]> = {
  hotel: [
    "Clean room, friendly front desk and easy to find. Would stay again.",
    "Good value for the area. Breakfast was simple but fresh and the staff were helpful.",
    "Quiet floor, strong wifi and a comfortable bed. Check-in took two minutes.",
    "Close to everything we wanted to see. The room matched the photos.",
    "Great stay for a short work trip. Hot water and aircon both worked well.",
    "Staff helped us arrange a ride to the airport early in the morning.",
  ],
  motel: [
    "Simple, tidy and exactly what we needed for one night. Friendly owner.",
    "Fair price and a short walk to food. The room was clean and cool.",
    "Easy check-in and a safe place to park. Good for a quick stop.",
    "Basic but comfortable. The family running it were kind and helpful.",
    "Quiet at night and the fan room was surprisingly comfortable.",
    "Would recommend for budget travellers who want a clean bed.",
  ],
  resort: [
    "Beautiful setting and the pool was the highlight. Staff remembered our names.",
    "Walking to the beach in two minutes was perfect. Dinner on the sand was great.",
    "Relaxing and well kept. Our villa was spacious and very quiet.",
    "Lovely sunsets from the room. Breakfast had plenty of choice.",
    "A real getaway. The team arranged boat trips and a late checkout for us.",
    "Great for a couple's weekend. We want to come back for longer.",
  ],
  campsite: [
    "Cool air, pine trees and a great campfire evening. The tent was dry and cosy.",
    "Peaceful and beautiful. Bathrooms were clean and the hosts were lovely.",
    "Perfect for a digital detox. We loved waking up to the mist.",
    "The cabin was warm at night. Staff set up the campfire for us.",
    "Great for friends. Bring a jacket, nights get cold.",
    "Easy to reach and well organised. The kids loved it.",
  ],
};

export function demoReviewSummary(stay: Stay): ReviewSummary {
  const s = stay.rating?.score ?? 4.2;
  const count = stay.rating?.count ?? 0;
  const h = hash(stay.id);

  const five = clamp(Math.round(40 + (s - 3.5) * 30), 40, 88);
  const rest = 100 - five;
  const four = Math.round(rest * 0.6), three = Math.round(rest * 0.25), two = Math.round(rest * 0.1);
  const distribution = [five, four, three, two, rest - four - three - two];

  const offsets: Record<RvKey, number> = { cleanliness: 0.1, staff: 0.2, location: 0, value: -0.2, comfort: 0.1, checkin: 0.15 };
  const categories = (Object.keys(offsets) as RvKey[]).map((key, i) => ({ key, score: Math.round(clamp(s + offsets[key] + ((h >> i) % 3) * 0.02 - 0.02, 3, 5) * 10) / 10 }));

  const topicOrder: TopicKey[] = ["cleanliness", "staff", "location", "value", "comfort", "breakfast", "quiet", "view"];
  const topics = topicOrder.map((key, i) => ({ key, count: Math.max(3, Math.round(count * (0.62 - i * 0.07) * (0.85 + ((h >> (i + 2)) % 4) * 0.05))) })).sort((a, b) => b.count - a.count);

  const texts = TEXT[stay.category];
  // Each card mentions the topics its text hints at, plus two fixed ones so every topic chip matches at least one card.
  const KEYWORDS: Record<TopicKey, RegExp> = {
    cleanliness: /clean|tidy/i, staff: /staff|desk|owner|host|team|family/i, location: /close|walk|near|easy to (find|reach)/i, value: /value|price|budget/i,
    comfort: /comfort|bed|cosy|warm/i, breakfast: /breakfast/i, quiet: /quiet|peaceful/i, view: /view|sunset|mist/i,
  };
  const cards = NAMES.map(([author, avatar], i) => ({
    author, avatar,
    topics: topicOrder.filter((k) => KEYWORDS[k].test(texts[(i + (h % 3)) % texts.length]!) || k === topicOrder[i] || k === topicOrder[(i + 4) % 8]),
    score: i === 2 || i === 4 ? 4 : 5, when: WHEN[i]!, text: texts[(i + (h % 3)) % texts.length]!,
  }));
  return { distribution, categories, topics, cards };
}

import { FAQ, type FaqItem } from "./faq";

/** The questions offered as buttons when the helper opens. They point at entries in the FAQ. */
export const SUGGESTED_IDS = ["how-to-book", "request", "pay-when", "cancel", "refund", "rooms", "coupon", "foreigner"];

const STOP = new Set(["the", "a", "an", "is", "are", "do", "does", "i", "my", "me", "can", "how", "what", "when", "to", "of", "for", "and", "or", "in", "on", "it", "if", "you", "we", "this", "that", "will", "get", "have", "has", "be", "with", "at", "so", "any"]);

const words = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");

/** Finds the FAQ entry that best fits a typed question, or null when nothing fits well enough. A question title match counts more than an answer match. */
export function findAnswer(input: string, items: FaqItem[] = FAQ): FaqItem | null {
  const query = new Set(words(input).map(stem));
  if (query.size === 0) return null;
  let best: { item: FaqItem; score: number } | null = null;
  for (const item of items) {
    const inQ = new Set(words(item.q).map(stem));
    const inA = new Set(words(item.a).map(stem));
    let score = 0;
    for (const w of query) { if (inQ.has(w)) score += 3; else if (inA.has(w)) score += 1; }
    if (!best || score > best.score) best = { item, score };
  }
  return best && best.score >= 3 ? best.item : null;
}

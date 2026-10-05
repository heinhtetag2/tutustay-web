import type { PricingRules } from "@/domain";

/**
 * ASSUMPTION, NOT A BUSINESS RULE. The FAQ says a platform fee exists; the Terms are silent (docs/04 Q8).
 * Pay-at-hotel takes no payment through TuTuStay, so no fee. The deposit share is per stay (see fixtures).
 */
export const ASSUMED_PRICING_RULES: PricingRules = {
  platformFee: { pay_at_hotel: 0, online: 1000 },
};

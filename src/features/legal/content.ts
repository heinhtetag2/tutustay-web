/**
 * Plain-language SUMMARIES of the legal documents published at dev.tutustay.com/legal/* (versions below, 2026-07-17),
 * written for this prototype so guests can scan the important rules. They are NOT the legal text.
 * The full documents are owned by TuTuStay's legal team and must replace the placeholder body before launch.
 */
export interface LegalDoc {
  slug: "terms" | "privacy" | "cookies" | "location";
  title: string;
  intro: string;
  version: string;
  published: string;
  summary: string[];
}

export const LEGAL: LegalDoc[] = [
  {
    slug: "terms", title: "Terms of service", version: "1.0.1", published: "2026-07-17",
    intro: "The agreement between you and TuTuStay covering bookings, cancellations and use of the platform.",
    summary: [
      "TuTuStay is a marketplace. Your accommodation contract is with the hotel, and the hotel decides whether to accept your booking.",
      "A booking is a request, not a confirmed reservation. It moves through Pending, Accepted, Confirmed, Overdue, Rejected, Cancelled and Completed. Rejected, Cancelled and Completed are final.",
      "Two payment models exist: Pay at hotel (TuTuStay takes no payment) and Online payment through KBZPay / QPay, due after the hotel accepts and before the deadline on your booking.",
      "Cancellation is arranged by calling the hotel. There is no cancel button in the app. Each hotel sets its own cancellation and refund rules, and refunds go back to your original payment method.",
      "Prices are in Myanmar Kyat and set by the hotel. Taxes, service charges and any fee collected at the property are the hotel's and shown before you book.",
      "Coupons have a validity window, a per-user limit and a total pool, and not every hotel takes part. They have no cash value, and are reversed if the booking is cancelled.",
      "Only guests with a real booking can review a stay. Hotels can reply publicly and can ask us to hide a review, with a reason.",
      "You must be at least 16 to hold an account. You can delete your account in the app. It becomes permanent after 30 days, and legally required booking and payment records are kept.",
    ],
  },
  {
    slug: "privacy", title: "Privacy policy", version: "1.0.1", published: "2026-07-17",
    intro: "What personal data TuTuStay collects when you book, how it is used, and who it is shared with.",
    summary: [
      "We collect what a booking needs: your contact details, stay dates and a payment record. Nothing we don't use.",
      "We do not store full card numbers. Card handling stays with the payment provider.",
      "Identity details (NRC for local guests, passport or ID for foreign guests) are optional to give in advance. Hotels must record guest identity at check-in, and supplying it early lets you skip that at the desk.",
      "Your searches are saved to your account so you can return to recent ones. You can delete them one by one or all at once.",
      "Location is used only to sort stays near you and centre the map, and the app works if you say no.",
      "We never sell your data. Hotels see only the details they need to hold and honour your reservation.",
    ],
  },
  {
    slug: "cookies", title: "Cookie policy", version: "1.0.0", published: "2026-07-17",
    intro: "Which cookies and local storage this site uses, and what each is for.",
    summary: [
      "The live website sets one kind of cookie: Google Analytics 4, to count visits and see which pages are read.",
      "No advertising cookies, no advertising pixels, and nothing sold.",
      "The app uses no cookies. It keeps your login token in the phone's secure keystore and a few preferences on the device.",
      "This prototype stores its MOCK data (bookings, sign-in, favourites, coupons, enquiries) in your browser's local storage so flows can be tested. No analytics are included.",
    ],
  },
  {
    slug: "location", title: "Location service policy", version: "1.0.1", published: "2026-07-17",
    intro: "How TuTuStay uses your location to show nearby stays, and how to turn it off.",
    summary: [
      "Location is optional. Everything works without it: search by city or stay name instead.",
      "We read it only while you use a feature that needs it, such as Stay near you, the map or directions.",
      "We take one reading at the moment it is needed. We do not follow you and never collect location in the background.",
      "It is used to sort stays by distance, centre the map on you and draw directions.",
    ],
  },
];

export function findLegal(slug: string): LegalDoc | undefined {
  return LEGAL.find((d) => d.slug === slug);
}

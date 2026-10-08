import { createLocalStore } from "./mocks/localStore";

/** MOCK. Enquiries live in this browser only: nobody receives them. */
export interface Enquiry {
  id: string;
  /** The question title. Older saved enquiries may not have one. */
  subject?: string;
  topic: "booking" | "payment" | "account" | "other";
  bookingRef?: string;
  message: string;
  attachments: string[];
  createdAt: string;
  /** DEMO: a sample support reply. Real enquiries have none yet. */
  reply?: string;
}

export const enquiriesStore = createLocalStore<Enquiry[]>("enquiries", [
  { id: "ENQ-DEMO01", subject: "Early check-in", topic: "booking", bookingRef: "MOCK-DEMO01", message: "Can we check in earlier than 2 pm on arrival day? We land in Yangon at 9 am.", attachments: [], createdAt: "2026-10-01T09:00:00.000Z", reply: "Hello! Early check-in is subject to room availability. The hotel will try to have your room ready by 11 am and can store your luggage until then." },
  { id: "ENQ-DEMO02", subject: "KBZPay payment not showing", topic: "payment", message: "I paid by KBZPay but my booking still shows as waiting. Where can I check?", attachments: ["payment-screenshot.png"], createdAt: "2026-10-03T14:30:00.000Z" },
]);

export function createEnquiry(e: Omit<Enquiry, "id" | "createdAt">): Enquiry {
  const enquiry: Enquiry = { ...e, id: `ENQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, createdAt: new Date().toISOString() };
  enquiriesStore.set([enquiry, ...enquiriesStore.get()]);
  return enquiry;
}

/** The support address published in the Terms of Service §12. */
export const SUPPORT_EMAIL = "support@tutustay.com";

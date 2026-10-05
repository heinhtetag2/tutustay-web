import { createLocalStore } from "./mocks/localStore";

/** MOCK. Enquiries live in this browser only: nobody receives them. */
export interface Enquiry {
  id: string;
  topic: "booking" | "payment" | "account" | "other";
  bookingRef?: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

export const enquiriesStore = createLocalStore<Enquiry[]>("enquiries", []);

export function createEnquiry(e: Omit<Enquiry, "id" | "createdAt">): Enquiry {
  const enquiry: Enquiry = { ...e, id: `ENQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, createdAt: new Date().toISOString() };
  enquiriesStore.set([enquiry, ...enquiriesStore.get()]);
  return enquiry;
}

/** The support address published in the Terms of Service §12. */
export const SUPPORT_EMAIL = "support@tutustay.com";

import { z } from "zod";

/** Error messages are message KEYS, translated at render time. */
export const guestDetailsSchema = z
  .object({
    name: z.string().trim().min(2, "err.name"),
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "err.phone"),
    email: z.string().trim().email("err.email"),
    bookingForOther: z.boolean(),
    stayingGuestName: z.string().trim().optional(),
    specialRequests: z.string().trim().max(500, "err.requestsLong").optional(),
    acceptedTerms: z.literal(true, { message: "err.terms" }),
  })
  .refine((v) => !v.bookingForOther || (v.stayingGuestName && v.stayingGuestName.length >= 2), {
    path: ["stayingGuestName"],
    message: "err.stayingName",
  });

export type GuestDetailsInput = z.input<typeof guestDetailsSchema>;

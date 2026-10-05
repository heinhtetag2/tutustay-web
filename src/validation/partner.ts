import { z } from "zod";

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export const BUSINESS_TYPES = ["hotel", "motel", "resort", "tent"] as const;
export const COUNTRIES = ["MM", "TH", "SG", "MY", "VN", "LA", "KH", "CN", "IN", "JP", "KR", "US"] as const;

/** Error messages are message KEYS, translated at render time. */
export const partnerSchema = z.object({
  businessName: z.string().trim().min(2, "err.partner.businessName"),
  businessType: z.enum(BUSINESS_TYPES, { message: "err.partner.businessType" }),
  website: z.string().trim().url("err.partner.website").optional().or(z.literal("")),
  firstName: z.string().trim().min(1, "err.partner.firstName"),
  lastName: z.string().trim().min(1, "err.partner.lastName"),
  email: z.string().trim().email("err.email"),
  phoneCode: z.string().regex(/^\+\d{1,3}$/, "err.phone"),
  phone: z.string().trim().regex(/^[0-9 ()-]{6,15}$/, "err.phone"),
  street: z.string().trim().min(3, "err.partner.street"),
  unit: z.string().trim().optional(),
  city: z.string().trim().min(2, "err.partner.city"),
  region: z.string().trim().optional(),
  country: z.enum(COUNTRIES, { message: "err.partner.country" }),
  postal: z.string().trim().optional(),
});

export type PartnerInput = z.input<typeof partnerSchema>;

/** Returns a message key for the first problem with the chosen files, or null if they're fine. */
export function validateFiles(files: { size: number; type: string }[]): "err.partner.filesCount" | "err.partner.fileType" | "err.partner.fileSize" | null {
  if (files.length > MAX_FILES) return "err.partner.filesCount";
  if (files.some((f) => !ALLOWED_TYPES.includes(f.type))) return "err.partner.fileType";
  if (files.some((f) => f.size > MAX_FILE_BYTES)) return "err.partner.fileSize";
  return null;
}

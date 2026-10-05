import { describe, expect, it } from "vitest";
import { partnerSchema, validateFiles } from "./partner";

const valid = {
  businessName: "Lantern Inn", businessType: "hotel", website: "", firstName: "Mya", lastName: "Aye", email: "mya@example.test",
  phoneCode: "+95", phone: "9 123 456", street: "12 Main Road", city: "Yangon", country: "MM",
} as const;

describe("partnerSchema", () => {
  it("accepts a complete application with optional fields blank", () => {
    expect(partnerSchema.safeParse(valid).success).toBe(true);
  });
  it("returns message keys, not English, for each problem", () => {
    const r = partnerSchema.safeParse({ ...valid, businessName: "", email: "nope", phoneCode: "95" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const msgs = r.error.issues.map((i) => i.message);
      expect(msgs).toEqual(expect.arrayContaining(["err.partner.businessName", "err.email", "err.phone"]));
    }
  });
  it("rejects a malformed website but allows none", () => {
    expect(partnerSchema.safeParse({ ...valid, website: "not a url" }).success).toBe(false);
    expect(partnerSchema.safeParse({ ...valid, website: "https://lantern.example" }).success).toBe(true);
  });
});

describe("validateFiles", () => {
  const ok = { size: 1000, type: "application/pdf" };
  it("allows up to 5 PDFs or images under 5MB", () => expect(validateFiles([ok, ok, ok, ok, ok])).toBeNull());
  it("flags too many, wrong type and too large", () => {
    expect(validateFiles(Array(6).fill(ok))).toBe("err.partner.filesCount");
    expect(validateFiles([{ size: 1, type: "text/plain" }])).toBe("err.partner.fileType");
    expect(validateFiles([{ size: 6 * 1024 * 1024, type: "image/png" }])).toBe("err.partner.fileSize");
  });
});

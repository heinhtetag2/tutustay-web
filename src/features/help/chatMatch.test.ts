import { describe, expect, it } from "vitest";
import { findAnswer, SUGGESTED_IDS } from "./chatMatch";
import { FAQ } from "./faq";

describe("chat helper matching", () => {
  it("every suggested question exists in the FAQ", () => {
    for (const id of SUGGESTED_IDS) expect(FAQ.some((f) => f.id === id)).toBe(true);
  });
  it("finds the cancel answer", () => expect(findAnswer("how can I cancel my booking")?.id).toBe("cancel"));
  it("finds the refund answer", () => expect(findAnswer("will I get my money back refund")?.id).toBe("refund"));
  it("returns null for something unrelated", () => expect(findAnswer("what is the weather like")).toBeNull());
  it("returns null for an empty message", () => expect(findAnswer("   ")).toBeNull());
});

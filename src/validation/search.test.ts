import { describe, expect, it } from "vitest";
import { parseSearchParams, toQueryString } from "./search";

const today = "2026-10-05";

describe("parseSearchParams", () => {
  it("defaults to today/tomorrow, 2 adults, 1 room, overnight", () => {
    const { params, datesRepaired } = parseSearchParams({}, today);
    expect(params).toMatchObject({ checkIn: today, checkOut: "2026-10-06", adults: 2, rooms: 1, stayType: "overnight", sort: "recommended" });
    expect(datesRepaired).toBe(false);
  });
  it("repairs invalid dates and reports it", () => {
    const { params, datesRepaired } = parseSearchParams({ checkIn: "2026-10-09", checkOut: "2026-10-08" }, today);
    expect(params.checkIn).toBe(today);
    expect(datesRepaired).toBe(true);
  });
  it("never throws on garbage", () => {
    const { params } = parseSearchParams({ adults: "abc", rooms: "99", stayType: "weekly", sort: "x", sessionHours: "5" }, today);
    expect(params).toMatchObject({ adults: 2, rooms: 1, stayType: "overnight", sort: "recommended", sessionHours: 3 });
  });
  it("round-trips through the query string without defaults", () => {
    const { params } = parseSearchParams({ place: "Yangon", checkIn: "2026-10-10", checkOut: "2026-10-12", stayType: "session", sessionHours: "6", foreigner: "1" }, today);
    const qs = toQueryString(params);
    expect(qs).toContain("stayType=session");
    expect(qs).not.toContain("adults=");
    const again = parseSearchParams(Object.fromEntries(new URLSearchParams(qs)), today).params;
    expect(again).toMatchObject({ place: "Yangon", stayType: "session", sessionHours: 6, foreigner: true });
  });
});

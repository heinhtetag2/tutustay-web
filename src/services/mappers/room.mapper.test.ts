import { describe, expect, it } from "vitest";
import { availableRoomsDto } from "../api/dto";
import { mapRoom } from "./room.mapper";
import { rateFor } from "@/domain";

// A real response captured from dev.tutustay.com on 2026-10-05 (trimmed to the first room).
const observed = [
  {
    id: 115, name: "Deluxe", bed: "Single", capacity: 2, availableCount: 1, price: 40000, foreignerPrice: 50000,
    dayUsePrice: 0, foreignerDayUsePrice: 0, daycationPrice: 0, foreignerDaycationPrice: 0, refundable: false,
    photos: ["https://example.test/a.png"],
    amenities: [{ name: "AC", icon: "ac", image: "x" }, { name: "Electric kettle", icon: "frontdesk", image: "y" }],
  },
];

describe("room mapper", () => {
  it("parses the observed response and maps it to a domain Room", () => {
    const dto = availableRoomsDto.parse(observed);
    const room = mapRoom(dto[0]!);
    expect(room).toMatchObject({ id: "115", name: "Deluxe", capacity: 2, availableCount: 1, refundable: false, amenities: ["AC", "Electric kettle"] });
    expect(rateFor(room, "overnight", "local")).toBe(40000);
    expect(rateFor(room, "overnight", "foreigner")).toBe(50000);
    expect(rateFor(room, "session", "local")).toBeNull(); // 0 = not offered
  });
  it("fails loudly when the API shape changes", () => {
    expect(availableRoomsDto.safeParse([{ id: 1, name: "x" }]).success).toBe(false);
  });
});

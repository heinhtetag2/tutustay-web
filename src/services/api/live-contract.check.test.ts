import { describe, expect, it } from "vitest";
import { availableRoomsDto } from "./dto";
import { mapRoom } from "../mappers/room.mapper";

/** Opt-in contract check against the real dev API: `LIVE_CONTRACT=1 npx vitest run live-contract`. Skipped by default. */
const run = process.env.LIVE_CONTRACT ? describe : describe.skip;
run("live rooms contract (dev.tutustay.com)", () => {
  for (const id of [29, 51, 47]) {
    it(`hotel ${id} matches the DTO`, async () => {
      const res = await fetch(`https://dev.tutustay.com/api/hotel/${id}/available-rooms?stayType=night&checkIn=2026-10-10&checkOut=2026-10-11&guests=2&rooms=1`);
      expect(res.ok).toBe(true);
      const parsed = availableRoomsDto.safeParse(await res.json());
      if (!parsed.success) console.error(JSON.stringify(parsed.error.issues).slice(0, 400));
      expect(parsed.success).toBe(true);
      if (parsed.success) parsed.data.forEach((d) => expect(mapRoom(d).rates.overnight.local).toBeGreaterThanOrEqual(0));
    });
  }
});

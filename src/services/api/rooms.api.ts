import "server-only";
import type { Room } from "@/domain";
import { apiBaseUrl, apiGet } from "./http";
import { availableRoomsDto } from "./dto";
import { ApiError } from "./http";
import { mapRoom } from "../mappers/room.mapper";

export const liveRoomsEnabled = (): boolean => apiBaseUrl() !== null;

/** ASSUMPTION: the live API's `stayType` value for overnight is "night" (observed). Session and daycation values are unconfirmed. */
const STAY_TYPE_PARAM = { overnight: "night", session: "session", daycation: "daycation" } as const;

export async function fetchAvailableRooms(
  stayId: string,
  p: { checkIn: string; checkOut: string; adults: number; children: number; rooms: number; stayType: keyof typeof STAY_TYPE_PARAM },
): Promise<Room[]> {
  const raw = await apiGet(`/api/hotel/${encodeURIComponent(stayId)}/available-rooms`, {
    stayType: STAY_TYPE_PARAM[p.stayType], checkIn: p.checkIn, checkOut: p.checkOut, guests: p.adults + p.children, rooms: p.rooms,
  });
  const parsed = availableRoomsDto.safeParse(raw);
  if (!parsed.success) throw new ApiError("Unexpected rooms response shape", "shape");
  return parsed.data.map(mapRoom);
}

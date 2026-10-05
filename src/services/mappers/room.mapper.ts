import type { Room } from "@/domain";
import type { AvailableRoomDto } from "../api/dto";

/**
 * The ONLY place that knows the API's field names.
 * ASSUMPTION (docs/04 Q3): `dayUse*` prices are our "Session" rates and `daycation*` prices are "Daycation".
 * A price of 0 means "not offered", matching the live API's convention.
 */
export function mapRoom(dto: AvailableRoomDto): Room {
  return {
    id: String(dto.id),
    name: dto.name,
    bed: dto.bed,
    capacity: dto.capacity,
    availableCount: dto.availableCount,
    refundable: dto.refundable,
    amenities: dto.amenities.map((a) => a.name),
    rates: {
      overnight: { local: dto.price, foreigner: dto.foreignerPrice },
      session: { local: dto.dayUsePrice, foreigner: dto.foreignerDayUsePrice },
      daycation: { local: dto.daycationPrice, foreigner: dto.foreignerDaycationPrice },
    },
  };
}

import { z } from "zod";

/**
 * Shape of GET /api/hotel/:id/available-rooms, as OBSERVED on dev.tutustay.com (2026-10-05).
 * Only fields seen in a real response are listed. Unknown extras are ignored, missing ones fail loudly.
 */
export const availableRoomDto = z.object({
  id: z.number(),
  name: z.string(),
  bed: z.string(),
  capacity: z.number().int().nonnegative(),
  availableCount: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  foreignerPrice: z.number().nonnegative(),
  dayUsePrice: z.number().nonnegative(),
  foreignerDayUsePrice: z.number().nonnegative(),
  daycationPrice: z.number().nonnegative(),
  foreignerDaycationPrice: z.number().nonnegative(),
  refundable: z.boolean(),
  photos: z.array(z.string()).default([]),
  amenities: z.array(z.object({ name: z.string() })).default([]),
});

export const availableRoomsDto = z.array(availableRoomDto);
export type AvailableRoomDto = z.infer<typeof availableRoomDto>;

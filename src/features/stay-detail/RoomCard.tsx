import { rateFor, nightsBetween, type GuestType, type PaymentMode, type Room, type StayType } from "@/domain";
import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { AmenityIcon } from "@/shared/ui/AmenityIcon";
import { Badge } from "@/shared/ui/Badge";
import { roomPhotos } from "./photos";
import { RoomPhotos } from "./RoomPhotos";
import { RoomPrice } from "./RoomPrice";
import { RoomQuantity } from "./RoomQuantity";

interface Props {
  room: Room;
  locale: Locale;
  stayId: string;
  checkIn: string;
  checkOut: string;
  /** How many of this room are picked (0 = none). */
  selected: number;
  stayType: StayType;
  guestType: GuestType;
  /** Query string carrying the whole search state into the booking step. */
  query: string;
  payment: { mode: PaymentMode; depositPct?: number };
}

export function RoomCard({ room, locale, stayId, checkIn, checkOut, selected, stayType, guestType, query, payment }: Props) {
  const t = createT(locale);
  const rate = rateFor(room, stayType, guestType);
  const soldOut = room.availableCount === 0;
  const notOffered = rate === null;
  const nights = Math.max(1, nightsBetween(checkIn, checkOut));
  const bookable = !soldOut && !notOffered;

  return (
    <li className="rounded-card border border-border-subtle bg-surface-raised p-4 transition-colors duration-200 hover:border-text-primary md:p-5">
      <div className="flex gap-4">
        <RoomPhotos photos={roomPhotos(stayId, room.id)} name={room.name} className="size-32 md:size-48" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <h3 className="type-subheading">{room.name}</h3>
            <p className="type-body-sm text-text-secondary">{t("room.meta", { bed: room.bed, n: room.capacity })}</p>
          </div>
          <ul className="flex flex-wrap gap-1">{room.amenities.map((a) => <li key={a}><Badge className="gap-1.5"><AmenityIcon name={a} />{a}</Badge></li>)}</ul>
          <div className="flex flex-wrap gap-2">
            <Badge tone={room.refundable ? "success" : "warning"}>{room.refundable ? t("room.refundable") : t("room.nonRefundable")}</Badge>
            {bookable && room.availableCount <= 2 ? <Badge tone="warning">{t("room.fewLeft", { n: room.availableCount })}</Badge> : null}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border-subtle pt-4">
        {bookable ? (
          <>
            <RoomPrice rate={rate} nights={nights} rooms={Math.max(1, selected)} stayType={stayType} mode={payment.mode} depositPct={payment.depositPct} />
            <RoomQuantity roomId={room.id} value={Math.min(selected, room.availableCount)} max={room.availableCount} name={room.name} />
          </>
        ) : (
          <p className="type-label text-text-secondary">
            {soldOut ? t("room.soldOut") : t("room.typeNotOffered", { type: t(`stayType.${stayType}`) })}
          </p>
        )}
      </div>
    </li>
  );
}

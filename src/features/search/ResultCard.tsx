import type { CSSProperties } from "react";
import { formatDistance, ratingLabel } from "@/domain";
import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { LocalLink } from "@/shared/components/LocalLink";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";
import { Badge } from "@/shared/ui/Badge";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { stayCover } from "@/features/stay-detail/photos";
import { Price } from "@/shared/ui/Price";
import type { StaySummary } from "@/services/stays.service";
import { CompareToggle } from "./CompareToggle";
import { FavoriteButton } from "./FavoriteButton";

interface Props { item: StaySummary; locale: Locale; query: string; stayType: "overnight" | "session" | "daycation"; foreigner: boolean; layout?: "row" | "card"; index?: number; compare?: boolean; selected?: boolean; onHover?: (on: boolean) => void; onSelect?: () => void }

export function ResultCard({ item, locale, query, stayType, foreigner, layout = "row", index, compare = true, selected, onHover, onSelect }: Props) {
  const t = createT(locale);
  const { stay, fromRate, available, unavailableReason, distanceKm } = item;
  const unit = stayType === "overnight" ? t("price.perNight") : t("price.perStay");
  const card = layout === "card";
  const rating = stay.rating ? stay.rating.score.toFixed(1) : null;
  const place = `${stay.place.township ?? stay.place.city}, ${stay.place.city}${distanceKm !== undefined ? ` · ${t("near.away", { d: formatDistance(distanceKm) })}` : ""}`;
  const focus = selected ? "rounded-card ring-2 ring-action-primary ring-offset-4" : "";
  return (
    <li id={`stay-${stay.id}`} className={`anim-rise relative ${compare ? "pb-9" : ""}`} style={index === undefined ? undefined : ({ "--i": Math.min(index, 8) } as CSSProperties)} onMouseEnter={onHover ? () => onHover(true) : undefined} onMouseLeave={onHover ? () => onHover(false) : undefined} onFocus={onHover ? () => onHover(true) : undefined} onBlur={onHover ? () => onHover(false) : undefined}>
      <LocalLink
        href={`/stays/${stay.id}${query ? `?${query}` : ""}`}
        onClick={onSelect}
        className={`group flex gap-4 ${focus} ${card ? "h-full flex-col gap-3" : "items-start py-1"} ${available ? "" : "opacity-70"}`}
      >
        <div className={`relative shrink-0 overflow-hidden rounded-card ${card ? "aspect-[20/19] w-full" : "aspect-[20/19] w-36 sm:w-56"}`}>
          <PhotoTile src={stayCover(stay.id)} alt={stay.name} className="absolute inset-0 size-full transition-transform duration-300 group-hover:scale-[1.03]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-start justify-between gap-3 pr-1">
            <h2 className="type-subheading min-w-0">{stay.name}</h2>
            {rating ? <span className="type-body-sm flex shrink-0 items-center gap-1"><span aria-hidden>★</span><span><span className="sr-only">{t(`rating.${ratingLabel(stay.rating!.score)}`)} · </span>{rating}</span></span> : null}
          </div>
          <p className="type-body-sm text-text-secondary">{t(`category.${stay.category}`)} · {place}</p>
          <p className="type-body-sm text-text-secondary">{stay.rating ? t("review.score", { score: rating!, n: stay.rating.count }) : t("review.none")}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <PaymentModeBadge mode={stay.payment.mode} depositPct={stay.payment.depositPct} />
            {foreigner ? <Badge>{t("price.foreignerRate")}</Badge> : null}
            {stay.rooms.some((r) => r.refundable) ? <Badge tone="success">{t("room.refundable")}</Badge> : null}
            {stay.couponEligible ? <Badge tone="promo">{t("coupon.eligible")}</Badge> : null}
          </div>
          <div className="mt-1.5">
            {available && fromRate !== null ? (
              <Price amount={fromRate} unit={unit} prefix={t("price.from")} />
            ) : (
              <span className="type-label text-text-secondary">
                {unavailableReason === "stay_type_not_offered" ? t("stay.typeNotOffered", { type: t(`stayType.${stayType}`) }) : t("stay.soldOut")}
              </span>
            )}
          </div>
        </div>
      </LocalLink>
      <div className={card ? "absolute right-3 top-3" : "absolute left-24 top-1 sm:left-44"}><FavoriteButton stayId={stay.id} name={stay.name} overlay /></div>
      {compare ? <div className="absolute bottom-0 right-0"><CompareToggle stayId={stay.id} name={stay.name} /></div> : null}
    </li>
  );
}

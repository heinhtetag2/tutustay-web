import type { CSSProperties } from "react";
import { formatDistance, ratingLabel } from "@/domain";
import type { Locale } from "@/i18n/config";
import { dataLabel } from "@/i18n/dataLabels";
import { createT } from "@/i18n/translate";
import { LocalLink } from "@/shared/components/LocalLink";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";
import { Badge } from "@/shared/ui/Badge";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { stayCover } from "@/features/stay-detail/photos";
import { Price } from "@/shared/ui/Price";
import type { StaySummary } from "@/services/stays.service";
import { FavoriteButton } from "./FavoriteButton";

interface Props { item: StaySummary; locale: Locale; query: string; stayType: "overnight" | "session" | "daycation"; foreigner: boolean; layout?: "row" | "card" | "split" | "wide" | "compact"; index?: number; selected?: boolean; onHover?: (on: boolean) => void; onSelect?: () => void }

export function ResultCard({ item, locale, query, stayType, foreigner, layout = "row", index, selected, onHover, onSelect }: Props) {
  const t = createT(locale);
  const { stay, fromRate, available, unavailableReason, distanceKm } = item;
  const unit = stayType === "overnight" ? t("price.perNight") : t("price.perStay");
  const card = layout === "card";
  // "compact": a small photo beside the details on phones, the full card from tablet up. Keeps long saved lists short.
  const compact = layout === "compact";
  const wide = layout === "wide";
  const split = layout === "split" || wide;
  const rating = stay.rating ? stay.rating.score.toFixed(1) : null;
  const place = `${dataLabel(locale, stay.place.township ?? stay.place.city)}, ${dataLabel(locale, stay.place.city)}${distanceKm !== undefined ? ` · ${t("near.away", { d: formatDistance(distanceKm) })}` : ""}`;
  const focus = selected ? "rounded-card ring-2 ring-action-primary ring-offset-4" : "";
  return (
    <li id={`stay-${stay.id}`} className={`anim-rise relative ${split ? "py-5" : ""}`} style={index === undefined ? undefined : ({ "--i": Math.min(index, 8) } as CSSProperties)} onMouseEnter={onHover ? () => onHover(true) : undefined} onMouseLeave={onHover ? () => onHover(false) : undefined} onFocus={onHover ? () => onHover(true) : undefined} onBlur={onHover ? () => onHover(false) : undefined}>
      <LocalLink
        href={`/stays/${stay.id}${query ? `?${query}` : ""}`}
        onClick={onSelect}
        className={`group flex gap-4 ${focus} ${compact ? "items-start gap-3 sm:h-full sm:flex-col sm:items-stretch" : card ? "h-full flex-col gap-3" : wide ? "flex-col items-stretch gap-4 sm:flex-row sm:gap-6" : split ? "flex-col items-stretch gap-3 sm:flex-row lg:flex-col lg:gap-3" : "items-start py-1"} ${available ? "" : "opacity-70"}`}
      >
        <div className={`relative shrink-0 overflow-hidden rounded-card ${compact ? "aspect-square w-28 sm:aspect-[20/19] sm:w-full" : card ? "aspect-[20/19] w-full" : wide ? "aspect-[4/3] w-full sm:w-64 lg:w-80" : split ? "aspect-[4/3] w-full sm:w-56 lg:w-full" : "aspect-[20/19] w-36 sm:w-56"}`}>
          <PhotoTile src={stayCover(stay.id)} alt={stay.name} className="absolute inset-0 size-full transition-transform duration-300 group-hover:scale-[1.03]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-start justify-between gap-3 pr-1">
            <h2 className="type-subheading min-w-0">{stay.name}</h2>
            {rating ? <span className="type-body-sm flex shrink-0 items-center gap-1"><span aria-hidden>★</span><span><span className="sr-only">{t(`rating.${ratingLabel(stay.rating!.score)}`)} · </span>{rating}</span></span> : null}
          </div>
          <p className="type-body-sm flex items-start gap-1.5 text-text-secondary">
            <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6.500-5.600-6.500-11a6.500 6.500 0 0 1 13 0C18.500 15.400 12 21 12 21Z" /><circle cx="12" cy="10" r="2.300" /></svg>
            <span className="min-w-0"><span className="font-medium text-text-primary">{place}</span> · {t(`category.${stay.category}`)}</span>
          </p>
          <p className="type-body-sm flex items-center gap-1.5 text-text-secondary">
            {stay.rating ? (
              <>
                <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0 text-text-primary" fill="currentColor"><path d="m8 1.200 2 4.300 4.600.600-3.400 3.200.9 4.600L8 11.600 3.900 13.900l.9-4.600L1.400 6.100 6 5.500Z" /></svg>
                <span><span className="font-medium text-text-primary">{rating}</span> · {t("review.n", { n: stay.rating.count })}</span>
              </>
            ) : t("review.none")}
          </p>
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
      <div className={compact ? "absolute left-[5.5rem] top-2 sm:left-auto sm:right-3 sm:top-3" : card ? "absolute right-3 top-3" : wide ? "absolute right-3 top-8 sm:left-[14rem] sm:right-auto lg:left-[17rem]" : split ? "absolute right-3 top-8 sm:left-[11rem] sm:right-auto lg:left-auto lg:right-3" : "absolute left-24 top-1 sm:left-44"}><FavoriteButton stayId={stay.id} name={stay.name} overlay /></div>
    </li>
  );
}

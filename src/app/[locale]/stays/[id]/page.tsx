import { notFound } from "next/navigation";
import { lowestRate, nightsBetween, stayTypesOffered, todayIso } from "@/domain";
import { BookingCard } from "@/features/stay-detail/BookingCard";
import { RoomCard } from "@/features/stay-detail/RoomCard";
import { PhotoGallery } from "@/features/stay-detail/PhotoGallery";
import { StayActions } from "@/features/stay-detail/StayActions";
import { NearbyStays } from "@/features/stay-detail/NearbyStays";
import { StayLocation } from "@/features/stay-detail/StayLocation";
import { StayPolicies } from "@/features/stay-detail/StayPolicies";
import { StayReviews } from "@/features/stay-detail/StayReviews";
import { StaySections } from "@/features/stay-detail/StaySections";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { findNextAvailableStart, getAvailableRooms, getStay } from "@/services/stays.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { Container, Section } from "@/shared/layout/Container";
import { Price } from "@/shared/ui/Price";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { parseSearchParams, toQueryString } from "@/validation/search";
import { addDays, formatDate, ratingLabel } from "@/domain";
import { FEATURES } from "@/config/features";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";

type Props = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const stay = await getStay(id);
  return { title: stay?.name ?? "Stay" };
}

export default async function StayPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const stay = await getStay(id);
  if (!stay) notFound();

  const t = createT(locale);
  const today = todayIso();
  const { params: p } = parseSearchParams(await searchParams, today);
  const rooms = await getAvailableRooms(id, p);
  const guestType = p.foreigner ? "foreigner" : "local";
  const offered = stayTypesOffered(stay.rooms);
  const fromRate = lowestRate(rooms, p.stayType, guestType);
  const allSoldOut = rooms.every((r) => r.availableCount === 0);
  const typeMissing = !offered.includes(p.stayType);
  const nights = Math.max(1, nightsBetween(p.checkIn, p.checkOut));
  const query = toQueryString({
    checkIn: p.checkIn, checkOut: p.checkOut, adults: p.adults, children: p.children, rooms: p.rooms,
    stayType: p.stayType, sessionHours: p.sessionHours, foreigner: p.foreigner,
  });
  const nextStart = allSoldOut ? await findNextAvailableStart(id, p) : null;
  const back = toQueryString({ ...p, place: p.place });

  return (
    <Container className="pb-28 lg:pb-8">
      <nav aria-label={t("stay.breadcrumb")} className="py-4">
        <ol className="type-body-sm flex min-w-0 items-center gap-1 text-text-secondary">
          <li className="shrink-0">
            <LocalLink href={`/search${back ? `?${back}` : ""}`} className="inline-flex min-h-11 items-center rounded-control px-1 hover:text-text-brand hover:underline">{t("search.results")}</LocalLink>
          </li>
          <li aria-hidden className="shrink-0">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
          </li>
          <li aria-current="page" className="min-w-0 truncate px-1 font-medium text-text-primary">{stay.name}</li>
        </ol>
      </nav>

      <header>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <h1 className="type-title">{stay.name}</h1>
          <StayActions stayId={stay.id} name={stay.name} />
        </div>
      </header>

      <div className="mt-4"><PhotoGallery stayId={stay.id} name={stay.name} rooms={stay.rooms.map((r) => ({ id: r.id, name: r.name }))} /></div>

      <div className="mt-4">
        <p className="type-heading">{t(`category.${stay.category}`)} · {[stay.place.township, stay.place.city].filter(Boolean).join(", ")}</p>
        <p className="type-body-sm mt-1 flex items-center gap-1.5 text-text-secondary">
          {stay.rating ? (
            <>
              <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0 text-text-primary" fill="currentColor"><path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5L2.6 9.6l6.5-.9Z" /></svg>
              <span>{`${t(`rating.${ratingLabel(stay.rating.score)}`)} · ${t("review.score", { score: stay.rating.score.toFixed(1), n: stay.rating.count })}`}</span>
            </>
          ) : t("review.none")}
        </p>
        <div className="mt-3"><PaymentModeBadge mode={stay.payment.mode} depositPct={stay.payment.depositPct} /></div>
      </div>


      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <Section id="rooms" className="pt-2">
            <h2 className="type-heading mb-4">{t("stay.rooms")}</h2>
            {allSoldOut ? (
              <StatusBanner tone="warning" title={t("stay.soldOut")} className="mb-4">
                {nextStart ? (
                  <>
                    {t("stay.nextAvailable", { date: formatDate(nextStart) })}{" "}
                    <LocalLink className="text-text-link underline" href={`/stays/${id}?${toQueryString({ ...p, checkIn: nextStart, checkOut: addDays(nextStart, nights) })}`}>{t("stay.useDates")}</LocalLink>
                  </>
                ) : t("stay.noDates")}
              </StatusBanner>
            ) : null}
            {typeMissing ? <StatusBanner tone="info" className="mb-4">{t("stay.typeNotOffered", { type: t(`stayType.${p.stayType}`) })}</StatusBanner> : null}
            <ul className="flex flex-col gap-4">
              {rooms.map((r) => (
                <RoomCard key={r.id} room={r} locale={locale} stayId={id} checkIn={p.checkIn} checkOut={p.checkOut} rooms={p.rooms} stayType={p.stayType} guestType={guestType} query={query} payment={stay.payment} />
              ))}
            </ul>
          </Section>
          {FEATURES.showPhoneBeforeBooking ? (
            <section aria-labelledby="ask" className="mt-4 rounded-card border border-border-subtle bg-surface-raised p-5">
              <h2 id="ask" className="type-subheading">{t("stay.ask")}</h2>
              <p className="type-body-sm mt-1 text-text-secondary">{t("stay.askBody", { name: stay.name })}</p>
              <a href={`tel:${stay.phone.replace(/\s/g, "")}`} className="type-label mt-3 inline-flex min-h-11 items-center rounded-control border border-border-control px-4 hover:bg-surface-subtle"><svg aria-hidden viewBox="0 0 24 24" className="mr-2 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>{t("status.call", { phone: stay.phone })}</a>
            </section>
          ) : null}
          <StaySections stay={stay} locale={locale} />
        </div>

        <BookingCard params={p} today={today} offered={offered} fromRate={fromRate} soldOut={allSoldOut} sessionHours={stay.policies.sessionHours} />
      </div>

      <StayReviews stay={stay} />
      <StayLocation stay={stay} locale={locale} />
      <StayPolicies stay={stay} locale={locale} />
      <NearbyStays stay={stay} locale={locale} params={p} query={query} />

      {/* Mobile: the price and the primary action stay reachable. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border-subtle bg-surface-raised px-[var(--gutter)] py-3 lg:hidden">
        {fromRate !== null ? <Price amount={fromRate} prefix={t("price.from")} unit={p.stayType === "overnight" ? t("price.perNight") : t("price.perStay")} /> : <span className="type-label">{t("booking.noRates")}</span>}
        <a href="#rooms" className="type-label inline-flex min-h-11 items-center rounded-control bg-action-primary px-5 text-text-on-action">{t("booking.seeRooms")}</a>
      </div>
    </Container>
  );
}

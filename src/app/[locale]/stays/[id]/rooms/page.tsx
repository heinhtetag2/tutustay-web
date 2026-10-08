import { notFound } from "next/navigation";
import { addDays, formatDate, lowestRate, nightsBetween, rateFor, stayTypesOffered, todayIso } from "@/domain";
import { BookingCard } from "@/features/stay-detail/BookingCard";
import { RoomCard } from "@/features/stay-detail/RoomCard";
import { RoomFilters } from "@/features/stay-detail/RoomFilters";
import { StayBookingBar } from "@/features/stay-detail/StayBookingBar";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { findNextAvailableStart, getAvailableRooms, getStay } from "@/services/stays.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { Container } from "@/shared/layout/Container";
import { EmptyState } from "@/shared/ui/States";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { parseSelection } from "@/features/stay-detail/selection";
import { RoomSelectionSummary, type SelectableRoom } from "@/features/stay-detail/RoomSelectionSummary";
import { parseSearchParams, toQueryString } from "@/validation/search";

type Props = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const stay = await getStay(id);
  return { title: stay ? `${stay.name} · Rooms` : "Rooms" };
}

/** The room step: all rooms of one stay with filters, so the stay page itself stays about the property. */
export default async function StayRoomsPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const stay = await getStay(id);
  if (!stay) notFound();

  const t = createT(locale);
  const today = todayIso();
  const rawParams = await searchParams;
  const { params: p } = parseSearchParams(rawParams, today);
  const sel = parseSelection(rawParams.sel);
  const all = await getAvailableRooms(id, p);
  const guestType = p.foreigner ? "foreigner" : "local";
  const offered = stayTypesOffered(stay.rooms);
  const fromRate = lowestRate(all, p.stayType, guestType);
  const allSoldOut = all.every((r) => r.availableCount === 0);
  const typeMissing = !offered.includes(p.stayType);
  const nights = Math.max(1, nightsBetween(p.checkIn, p.checkOut));
  const query = toQueryString({
    checkIn: p.checkIn, checkOut: p.checkOut, adults: p.adults, children: p.children, rooms: p.rooms,
    stayType: p.stayType, sessionHours: p.sessionHours, foreigner: p.foreigner,
  });
  const nextStart = allSoldOut ? await findNextAvailableStart(id, p) : null;
  const stayHref = `/stays/${id}${query ? `?${query}` : ""}`;

  const rooms = all
    .filter((r) => p.beds.length === 0 || p.beds.includes(r.bed))
    .filter((r) => p.roomFacilities.every((f) => r.amenities.includes(f)))
    .filter((r) => !p.refundable || r.refundable);
  if (p.sort === "price-asc" || p.sort === "price-desc") {
    const price = (r: (typeof rooms)[number]) => rateFor(r, p.stayType, guestType) ?? Number.POSITIVE_INFINITY;
    rooms.sort((a, b) => (p.sort === "price-asc" ? price(a) - price(b) : price(b) - price(a)));
  }

  const selectable: SelectableRoom[] = all
    .map((r) => ({ id: r.id, name: r.name, rate: rateFor(r, p.stayType, guestType), available: r.availableCount, capacity: r.capacity }))
    .filter((r): r is SelectableRoom => r.rate !== null && r.available > 0);
  const summary = (className?: string, showAction = true) => (
    <RoomSelectionSummary showAction={showAction} stayId={id} rooms={selectable} nights={nights} stayType={p.stayType} mode={stay.payment.mode} depositPct={stay.payment.depositPct} guests={p.adults + p.children} query={query} className={className} />
  );

  return (
    <Container className="pb-28 lg:pb-8">
      <div className="pt-4"><Breadcrumbs crumbs={[{ href: stayHref, label: stay.name }]} current={t("stay.rooms")} future={[t("crumb.review"), t("crumb.confirmation")]} /></div>

      <header>
        <h1 className="type-title">{t("rooms.title")}</h1>
        <p className="type-body mt-1 text-text-secondary">{t(rooms.length === 1 ? "rooms.countOne" : "rooms.count", { n: rooms.length, name: stay.name })}</p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section id="rooms" aria-label={t("stay.rooms")} className="flex min-w-0 flex-col gap-4">
          <RoomFilters params={p} />
          {allSoldOut ? (
            <StatusBanner tone="warning" title={t("stay.soldOut")}>
              {nextStart ? (
                <>
                  {t("stay.nextAvailable", { date: formatDate(nextStart, false, locale) })}{" "}
                  <LocalLink className="text-text-link underline" href={`/stays/${id}/rooms?${toQueryString({ ...p, checkIn: nextStart, checkOut: addDays(nextStart, nights) })}`}>{t("stay.useDates")}</LocalLink>
                </>
              ) : t("stay.noDates")}
            </StatusBanner>
          ) : null}
          {typeMissing ? <StatusBanner tone="info">{t("stay.typeNotOffered", { type: t(`stayType.${p.stayType}`) })}</StatusBanner> : null}
          {rooms.length === 0 ? (
            <EmptyState title={t("rooms.none")} body={t("rooms.noneBody")} />
          ) : (
            <ul className="flex flex-col gap-4">
              {rooms.map((r) => (
                <RoomCard key={r.id} room={r} locale={locale} stayId={id} checkIn={p.checkIn} checkOut={p.checkOut} selected={sel[r.id] ?? 0} stayType={p.stayType} guestType={guestType} query={query} payment={stay.payment} />
              ))}
            </ul>
          )}
          <div className="rounded-card border border-border-subtle bg-surface-raised p-5 lg:hidden">{summary(undefined, false)}</div>
        </section>

        <BookingCard params={p} today={today} offered={offered} fromRate={fromRate} soldOut={allSoldOut} sessionHours={stay.policies.sessionHours} reserveHref={null} footer={summary()} />
      </div>

      <StayBookingBar params={p} today={today} offered={offered} fromRate={fromRate} soldOut={allSoldOut} sessionHours={stay.policies.sessionHours} action={<RoomSelectionSummary variant="bar" stayId={id} rooms={selectable} nights={nights} stayType={p.stayType} mode={stay.payment.mode} depositPct={stay.payment.depositPct} guests={p.adults + p.children} query={query} />} />
    </Container>
  );
}

import { notFound } from "next/navigation";
import { rateFor, todayIso } from "@/domain";
import { AuthGate } from "@/features/auth/AuthGate";
import { BookingReview } from "@/features/booking/BookingReview";
import { parseSelection } from "@/features/stay-detail/selection";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { getAvailableRooms, getStay } from "@/services/stays.service";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LinkButton } from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/States";
import { parseSearchParams, toQueryString } from "@/validation/search";

type Props = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata = { title: "Review your booking" };

export default async function BookPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const stay = await getStay(id);
  if (!stay) notFound();
  const t = createT(locale);
  const raw = await searchParams;
  const today = todayIso();
  const { params: p } = parseSearchParams(raw, today);
  const rooms = await getAvailableRooms(id, p);
  const guestType = p.foreigner ? "foreigner" : "local";
  // The picked rooms come from `sel` (several room types). A link with a single `room` still works and uses the guests-and-rooms count.
  const legacyId = Array.isArray(raw.room) ? raw.room[0] : raw.room;
  const sel = Object.keys(parseSelection(raw.sel)).length ? parseSelection(raw.sel) : legacyId ? { [legacyId]: p.rooms } : {};
  const lines = Object.entries(sel)
    .map(([rid, qty]) => ({ room: rooms.find((r) => r.id === rid), qty }))
    .filter((l): l is { room: NonNullable<typeof l.room>; qty: number } => Boolean(l.room));
  const totalRooms = lines.reduce((n, l) => n + l.qty, 0);
  const room = lines[0]?.room;
  const bookable = lines.length > 0 && lines.length === Object.keys(sel).length
    && lines.every((l) => l.qty <= l.room.availableCount && rateFor(l.room, p.stayType, guestType) !== null)
    && lines.reduce((n, l) => n + l.qty * l.room.capacity, 0) >= p.adults + p.children;
  const backQs = toQueryString({ ...p });

  return (
    <Container className="py-8">
      <PageHeader crumbs={[{ href: `/stays/${id}`, label: stay.name }, { href: `/stays/${id}/rooms${backQs ? `?${backQs}` : ""}`, label: t("stay.rooms") }]} crumbLabel={t("crumb.review")} future={[t("crumb.confirmation")]} title={t("review.title")} description={stay.name} />
      {!bookable || !room ? (
        // Recovery: the selection is preserved in the URL, so "Back to rooms" restores the same search.
        <ErrorState
          title={t("review.unavailable.title")}
          body={t("review.unavailable.body")}
          action={<LinkButton href={`/stays/${id}${backQs ? `?${backQs}` : ""}`}>{t("review.unavailable.action")}</LinkButton>}
        />
      ) : (
        <AuthGate reason="book">
          <BookingReview
            ctx={{
              stay: { id, name: stay.name, place: stay.place, coords: stay.coords, phone: stay.phone, checkIn: stay.policies.checkIn, checkOut: stay.policies.checkOut, payment: stay.payment },
              room: room!, lines, stayType: p.stayType, sessionHours: p.sessionHours, guestType,
              checkIn: p.checkIn, checkOut: p.checkOut, adults: p.adults, children: p.children, rooms: totalRooms, today,
            }}
          />
        </AuthGate>
      )}
    </Container>
  );
}

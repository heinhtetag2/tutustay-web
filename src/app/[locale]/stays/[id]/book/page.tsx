import { notFound } from "next/navigation";
import { rateFor, todayIso } from "@/domain";
import { AuthGate } from "@/features/auth/AuthGate";
import { BookingReview } from "@/features/booking/BookingReview";
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
  const roomId = Array.isArray(raw.room) ? raw.room[0] : raw.room;
  const room = rooms.find((r) => r.id === roomId);
  const guestType = p.foreigner ? "foreigner" : "local";
  const bookable = room && room.availableCount > 0 && rateFor(room, p.stayType, guestType) !== null;
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
              stay: { id, name: stay.name, phone: stay.phone, checkIn: stay.policies.checkIn, checkOut: stay.policies.checkOut, payment: stay.payment },
              room, stayType: p.stayType, sessionHours: p.sessionHours, guestType,
              checkIn: p.checkIn, checkOut: p.checkOut, adults: p.adults, children: p.children, rooms: p.rooms, today,
            }}
          />
        </AuthGate>
      )}
    </Container>
  );
}

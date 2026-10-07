import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { BookingStatusLoader } from "@/features/bookings/BookingStatusLoader";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "Booking status" };

export default async function BookingPage({ params }: { params: Promise<{ locale: string; ref: string }> }) {
  const { locale, ref } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container className="py-8">
      <PageHeader crumbs={[{ href: "/account/bookings", label: t("nav.myBookings") }]} title={t("status.pageTitle")} description={ref} />
      <AuthGate reason="account"><BookingStatusLoader bookingRef={ref} /></AuthGate>
    </Container>
  );
}

import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { BookingList } from "@/features/bookings/BookingList";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "My bookings" };

export default async function MyBookingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container className="py-8">
      <PageHeader title={t("nav.myBookings")} />
      <AuthGate reason="account"><BookingList /></AuthGate>
    </Container>
  );
}

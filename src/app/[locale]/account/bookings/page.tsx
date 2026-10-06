import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { BookingList } from "@/features/bookings/BookingList";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "My bookings" };

export default async function MyBookingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <div>
      <PageHeader title={t("nav.myBookings")} back={false} />
      <AuthGate reason="account"><BookingList /></AuthGate>
    </div>
  );
}

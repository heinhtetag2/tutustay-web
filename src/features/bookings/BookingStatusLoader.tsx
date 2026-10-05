"use client";

import { bookingsStore } from "@/services/bookings.service";
import { useT } from "@/i18n/I18nProvider";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useStore } from "@/shared/hooks/useStore";
import { LinkButton } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorState } from "@/shared/ui/States";
import { BookingStatusView } from "./BookingStatusView";

export function BookingStatusLoader({ bookingRef }: { bookingRef: string }) {
  const t = useT();
  const hydrated = useHydrated();
  const bookings = useStore(bookingsStore);
  const booking = bookings.find((b) => b.ref === bookingRef);
  if (!hydrated) return <Skeleton className="h-80 w-full" />;
  if (!booking) {
    return <ErrorState title={t("status.notFound.title")} body={t("status.notFound.body")} action={<LinkButton href="/account/bookings" variant="secondary">{t("nav.myBookings")}</LinkButton>} />;
  }
  return <BookingStatusView booking={booking} />;
}

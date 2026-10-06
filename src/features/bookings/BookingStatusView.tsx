"use client";

import { cancellationRoute, formatDate, needsOnlinePayment, type Booking, type BookingStatus } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { PriceBreakdown } from "@/features/booking/PriceBreakdown";
import { nextStatuses, transitionBooking } from "@/services/bookings.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";
import { Button, LinkButton } from "@/shared/ui/Button";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { ReviewForm } from "./ReviewForm";
import { StatusBadge } from "./StatusBadge";

const TONE: Record<BookingStatus, "info" | "success" | "warning" | "error"> = {
  pending: "info", accepted: "warning", confirmed: "success", overdue: "error", rejected: "error", cancelled: "info", completed: "success",
};

function minutesLeft(payBy?: string): number | null {
  return payBy ? Math.max(0, Math.round((new Date(payBy).getTime() - Date.now()) / 60_000)) : null;
}

export function BookingStatusView({ booking }: { booking: Booking }) {
  const t = useT();
  const locale = useLocale();
  const overnight = booking.stayType === "overnight";
  const mustPay = needsOnlinePayment(booking);
  const route = cancellationRoute(booking.status);
  const left = minutesLeft(booking.payBy);
  const bodyKey = (booking.status === "accepted" ? `status.body.accepted.${booking.mode}` : `status.body.${booking.status}`) as "status.body.pending";
  const next = nextStatuses(booking);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-6">
        <div className="rounded-card border border-border-subtle bg-surface-raised p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="type-heading">{t("status.title")}</h2><StatusBadge status={booking.status} />
          </div>
          <StatusBanner tone={TONE[booking.status]} className="mt-4">{t(bodyKey)}</StatusBanner>

          {mustPay ? (
            <div className="mt-4 flex flex-col gap-2">
              <p className="type-body">
                {booking.payBy ? t("status.payBy", { time: new Date(booking.payBy).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), n: left ?? 0 }) : null}
              </p>
              <Button onClick={() => transitionBooking(booking.ref, "confirmed")}>{t("status.payMock", { amount: booking.price.payNow.toLocaleString("en-US") })}</Button>
              <p className="type-body-sm text-text-secondary">{t("status.payMockNote")}</p>
            </div>
          ) : null}

          {booking.status === "rejected" || booking.status === "cancelled" ? (
            <div className="mt-4"><LinkButton href={`/search?checkIn=${booking.checkIn}&checkOut=${booking.checkOut}`} variant="secondary">{t("status.findSimilar")}</LinkButton></div>
          ) : null}
        </div>

        <section className="rounded-card border border-border-subtle bg-surface-raised p-5" aria-labelledby="details">
          <h2 id="details" className="type-heading mb-4">{t("status.details")}</h2>
          <dl className="type-body grid gap-3 sm:grid-cols-2">
            <div><dt className="type-label">{t("status.ref")}</dt><dd className="type-price-sm">{booking.ref}</dd></div>
            <div><dt className="type-label">{t("status.stay")}</dt><dd>{booking.stayName}</dd></div>
            <div><dt className="type-label">{t("status.room")}</dt><dd>{booking.roomName} × {booking.rooms}</dd></div>
            <div><dt className="type-label">{t("status.when")}</dt><dd>{overnight ? `${formatDate(booking.checkIn, false, locale)} → ${formatDate(booking.checkOut, false, locale)}` : formatDate(booking.checkIn, false, locale)}</dd></div>
            <div><dt className="type-label">{t("stayType.label")}</dt><dd>{t(`stayType.${booking.stayType}`)}{booking.sessionHours ? ` · ${t("stayType.hours", { n: booking.sessionHours })}` : ""}</dd></div>
            <div><dt className="type-label">{t("status.guest")}</dt><dd>{booking.guest.bookingForOther ? t("status.forOther", { name: booking.guest.stayingGuestName ?? "" }) : booking.guest.name}</dd></div>
            <div><dt className="type-label">{t("status.payment")}</dt><dd><PaymentModeBadge mode={booking.mode} /></dd></div>
            {booking.couponCode ? <div><dt className="type-label">{t("coupon.title")}</dt><dd>{booking.couponCode}</dd></div> : null}
          </dl>
        </section>

        <section className="rounded-card border border-border-subtle bg-surface-raised p-5" aria-labelledby="contact">
          <h2 id="contact" className="type-heading mb-2">{t("status.contactTitle")}</h2>
          <p className="type-body text-text-secondary">{t(route === "call_hotel" ? "cancel.byPhone" : "cancel.notNow")}</p>
          <p className="type-body-sm mt-2 text-text-secondary">{t(booking.refundable ? "policy.cancel.refundable" : "policy.cancel.nonRefundable")} {t("cancel.hotelRules")}</p>
          <a href={`tel:${booking.stayPhone.replace(/\s/g, "")}`} className="type-label mt-4 inline-flex min-h-11 items-center rounded-control border border-border-control px-4 hover:bg-surface-subtle"><svg aria-hidden viewBox="0 0 24 24" className="mr-2 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
            {t("status.call", { phone: booking.stayPhone })}
          </a>
        </section>

        <ReviewForm booking={booking} />

        <section className="rounded-card border border-dashed border-border-control bg-surface-subtle p-5" aria-labelledby="sim">
          <h2 id="sim" className="type-subheading">{t("sim.title")}</h2>
          <p className="type-body-sm mb-3 text-text-secondary">{t("sim.body")}</p>
          <div className="flex flex-wrap gap-2">
            {next.map((s) => (
              <Button key={s} variant="secondary" onClick={() => transitionBooking(booking.ref, s)}>{t("sim.set", { status: t(`status.${s}`) })}</Button>
            ))}
            {next.length === 0 ? <p className="type-body-sm">{t("sim.none")}</p> : null}
          </div>
        </section>
      </div>

      <aside aria-label={t("review.summary")} className="h-fit rounded-card border border-border-subtle bg-surface-raised p-5 shadow-raised lg:sticky lg:top-6">
        <h2 className="type-subheading mb-3">{t("status.price")}</h2>
        <PriceBreakdown price={booking.price} />
        <LocalLink href="/account/bookings" className="type-label mt-4 inline-block text-text-link">{t("nav.myBookings")}</LocalLink>
      </aside>
    </div>
  );
}

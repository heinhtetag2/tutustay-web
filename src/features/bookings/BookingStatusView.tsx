"use client";

import { useRef } from "react";
import { canCancelInApp, formatKs, cancellationRoute, formatDate, needsOnlinePayment, type Booking, type BookingStatus } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { PriceBreakdown } from "@/features/booking/PriceBreakdown";
import { bookingDeadline, nextStatuses, transitionBooking } from "@/services/bookings.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";
import { Button, LinkButton } from "@/shared/ui/Button";
import { formatCountdown, useCountdown } from "@/shared/hooks/useCountdown";
import { CancelBookingDialog } from "./CancelBookingDialog";
import { ReviewForm } from "./ReviewForm";
import { StatusBadge } from "./StatusBadge";

const HERO: Record<BookingStatus, { tone: string; icon: React.ReactNode }> = {
  pending: { tone: "from-[#dcfce7] via-[#f0fdf4] to-surface-raised border-[#86efac] text-[#166534] [--chip:#16a34a]", icon: <path d="M6.500 12.500 10.500 16.500 17.500 8" /> },
  accepted: { tone: "from-[#fef3c7] via-[#fffbeb] to-surface-raised border-[#fcd34d] text-[#92400e] [--chip:#d97706]", icon: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.500 1.500M9 2.500h6" /></> },
  confirmed: { tone: "from-[#dcfce7] via-[#f0fdf4] to-surface-raised border-[#86efac] text-[#166534] [--chip:#16a34a]", icon: <path d="M6.500 12.500 10.500 16.500 17.500 8" /> },
  completed: { tone: "from-[#dcfce7] via-[#f0fdf4] to-surface-raised border-[#86efac] text-[#166534] [--chip:#16a34a]", icon: <path d="M6.500 12.500 10.500 16.500 17.500 8" /> },
  overdue: { tone: "from-[#fee2e2] via-[#fef2f2] to-surface-raised border-[#fca5a5] text-[#991b1b] [--chip:#dc2626]", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7.500v5M12 16.500h.01" /></> },
  rejected: { tone: "from-[#fee2e2] via-[#fef2f2] to-surface-raised border-[#fca5a5] text-[#991b1b] [--chip:#dc2626]", icon: <path d="M7 7l10 10M17 7 7 17" /> },
  cancelled: { tone: "from-[#e2e8f0] via-[#f1f5f9] to-surface-raised border-[#cbd5e1] text-[#334155] [--chip:#64748b]", icon: <path d="M7 7l10 10M17 7 7 17" /> },
};

/** The first thing you see after booking: a big, clear "what happened" with the live timer when something is due. */
function StatusHero({ booking, body, timeLeft, deadline }: { booking: Booking; body: string; timeLeft: number | null; deadline: ReturnType<typeof bookingDeadline> }) {
  const t = useT();
  const h = HERO[booking.status];
  return (
    <section aria-live="polite" className={`relative overflow-hidden rounded-card border bg-gradient-to-br p-6 md:p-8 ${h.tone}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span aria-hidden className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white/60 ring-1 ring-white">
          <span className="flex size-14 items-center justify-center rounded-full bg-[var(--chip)] text-[#fff] shadow-[0_6px_16px_-4px_var(--chip)] ring-4 ring-white">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.800" strokeLinecap="round" strokeLinejoin="round">{h.icon}</svg>
          </span>
        </span>
        <div className="min-w-0">
          <h2 className="type-title text-text-primary">{t(`status.hero.${booking.status}`)}</h2>
          <p className="type-body mt-1 text-text-secondary">{body}</p>
          <p className="type-label mt-2 text-text-secondary">{booking.ref} · {booking.stayName}</p>
        </div>
      </div>
      {deadline && timeLeft !== null && timeLeft > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-field bg-white/70 px-4 py-3">
          <span className="type-display tabular-nums text-text-primary">{formatCountdown(timeLeft)}</span>
          <span className="type-body-sm text-text-secondary">{deadline.kind === "answer" ? t("status.timer.answer", { time: new Date(deadline.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }) : t("bar.left")}</span>
        </div>
      ) : null}
    </section>
  );
}

function minutesLeft(payBy?: string): number | null {
  return payBy ? Math.max(0, Math.round((new Date(payBy).getTime() - Date.now()) / 60_000)) : null;
}

export function BookingStatusView({ booking }: { booking: Booking }) {
  const t = useT();
  const locale = useLocale();
  const overnight = booking.stayType === "overnight";
  const sheet = useRef<HTMLDialogElement>(null);
  const mustPay = needsOnlinePayment(booking);
  const final = booking.status === "cancelled" || booking.status === "rejected" || booking.status === "completed";
  const route = cancellationRoute(booking.status);
  const left = minutesLeft(booking.payBy);
  const bodyKey = (booking.status === "accepted" ? `status.body.accepted.${booking.mode}` : booking.status === "cancelled" && booking.cancellation ? "status.body.cancelledUnpaid" : `status.body.${booking.status}`) as "status.body.pending";
  const next = nextStatuses(booking);
  const deadline = bookingDeadline(booking);
  const timeLeft = useCountdown(deadline?.at ?? null);

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[minmax(0,1fr)_380px] lg:pb-0">
      <div className="flex flex-col gap-6">
        <StatusHero booking={booking} body={t(bodyKey)} timeLeft={timeLeft} deadline={deadline} />
        <div className="rounded-card border border-border-subtle bg-surface-raised p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="type-heading">{t("status.title")}</h2><StatusBadge status={booking.status} />
          </div>
          {mustPay ? (
            <div className="mt-4 flex flex-col gap-2">
              <p className="type-body">
                {booking.payBy ? t("status.payBy", { time: new Date(booking.payBy).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), n: left ?? 0 }) : null}
              </p>
              <Button onClick={() => transitionBooking(booking.ref, "confirmed")}>{t("status.payMock", { amount: booking.price.payNow.toLocaleString("en-US") })}</Button>
              <p className="type-body-sm text-text-secondary">{t("status.payMockNote")}</p>
            </div>
          ) : null}

          {canCancelInApp(booking) ? <div className="mt-4"><CancelBookingDialog booking={booking} /></div> : null}

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
            {booking.cancellation?.reason ? <div><dt className="type-label">{t("cancel.reasonLabel")}</dt><dd>{t(`cancel.reason.${booking.cancellation.reason}`)}</dd></div> : null}
            {booking.couponCode ? <div><dt className="type-label">{t("coupon.title")}</dt><dd>{booking.couponCode}</dd></div> : null}
          </dl>
        </section>

        <section className="rounded-card border border-border-subtle bg-surface-raised p-5" aria-labelledby="contact">
          <h2 id="contact" className="type-heading mb-2">{t(final ? "status.contactAfterTitle" : "status.contactTitle")}</h2>
          {final ? (
            <p className="type-body text-text-secondary">{t("status.contactAfter")}</p>
          ) : (
            <>
              <p className="type-body text-text-secondary">{t(route === "call_hotel" ? "cancel.byPhone" : canCancelInApp(booking) ? "cancel.inApp" : "cancel.notNow")}</p>
              <p className="type-body-sm mt-2 text-text-secondary">{t(booking.refundable ? "policy.cancel.refundable" : "policy.cancel.nonRefundable")} {t("cancel.hotelRules")}</p>
            </>
          )}
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

      <aside aria-label={t("review.summary")} className="hidden h-fit rounded-card border border-border-subtle bg-surface-raised p-5 shadow-raised lg:sticky lg:top-6 lg:block">
        <h2 className="type-subheading mb-3">{t("status.price")}</h2>
        <PriceBreakdown price={booking.price} showNext={!final} />
        <LocalLink href="/account/bookings" className="type-label mt-4 inline-block text-text-link">{t("nav.myBookings")}</LocalLink>
      </aside>

      {/* Phones: the price opens from a slim bar at the bottom instead of sitting at the very end of a long page. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border-subtle bg-surface-raised px-[var(--gutter)] py-3 lg:hidden">
        <div className="min-w-0">
          <p className="type-body-sm text-text-secondary">{t("price.total")}</p>
          <p className="type-price-md">{formatKs(booking.price.total)}</p>
        </div>
        <Button type="button" variant="secondary" aria-haspopup="dialog" onClick={() => sheet.current?.showModal()}>
          {t("status.price")}
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6" /></svg>
        </Button>
      </div>
      <dialog
        ref={sheet} aria-label={t("status.price")}
        onClick={(e) => { if (e.target === sheet.current) sheet.current?.close(); }}
        className="sheet-up fixed inset-x-0 bottom-0 top-auto m-0 max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-sheet bg-surface-raised p-0 text-text-primary shadow-high backdrop:bg-black/50 lg:hidden"
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="type-heading">{t("status.price")}</h2>
          <button type="button" aria-label={t("common.close")} onClick={() => sheet.current?.close()} className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="max-h-[calc(88dvh-4.5rem)] overflow-y-auto px-5 pb-6 pt-3">
          <PriceBreakdown price={booking.price} showNext={!final} />
        </div>
      </dialog>
    </div>
  );
}

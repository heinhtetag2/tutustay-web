"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  applyCoupon, computePrice, formatDate, formatKs, INITIAL_STATUS, nightsBetween, rateFor,
  type GuestType, type PaymentMode, type Room, type StayType, type SessionHours,
} from "@/domain";
import { ASSUMED_PRICING_RULES } from "@/config/pricing";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { createBooking } from "@/services/bookings.service";
import { findCoupon } from "@/services/coupons.service";
import { guestSummaryText } from "@/shared/lib/guestSummary";
import { useMockSession } from "@/shared/hooks/useMockSession";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";
import { Button } from "@/shared/ui/Button";
import { Checkbox, Field, Input, Textarea } from "@/shared/ui/Field";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { guestDetailsSchema } from "@/validation/booking";
import { HowYoullPay } from "./HowYoullPay";
import { PriceBreakdown } from "./PriceBreakdown";

export interface ReviewContext {
  stay: { id: string; name: string; phone: string; checkIn: string; checkOut: string; payment: { mode: PaymentMode; depositPct?: number } };
  room: Room;
  stayType: StayType;
  sessionHours: SessionHours;
  guestType: GuestType;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  today: string;
}

type Errors = Partial<Record<"name" | "phone" | "email" | "stayingGuestName" | "specialRequests" | "acceptedTerms", string>>;

export function BookingReview({ ctx }: { ctx: ReviewContext }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const session = useMockSession();
  const { mode, depositPct } = ctx.stay.payment;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(session?.email ?? "");
  const [forOther, setForOther] = useState(false);
  const [stayingName, setStayingName] = useState("");
  const [requests, setRequests] = useState("");
  const [terms, setTerms] = useState(false);
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const clear = (k: keyof Errors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const rate = rateFor(ctx.room, ctx.stayType, ctx.guestType) ?? 0;
  const nights = Math.max(1, nightsBetween(ctx.checkIn, ctx.checkOut));
  const overnight = ctx.stayType === "overnight";

  const price = useMemo(
    () => computePrice({ unitRate: rate, nights, rooms: ctx.rooms, stayType: ctx.stayType, discount: applied?.discount, mode, depositPct, rules: ASSUMED_PRICING_RULES }),
    [rate, nights, ctx.rooms, ctx.stayType, applied, mode, depositPct],
  );

  function onApplyCoupon() {
    const subtotal = computePrice({ unitRate: rate, nights, rooms: ctx.rooms, stayType: ctx.stayType, mode, depositPct, rules: ASSUMED_PRICING_RULES }).subtotal;
    const coupon = findCoupon(code);
    const result = applyCoupon(coupon, subtotal, ctx.today);
    if (result.ok && coupon) {
      setApplied({ code: coupon.code, discount: result.discount });
      setCouponMsg({ tone: "success", text: t("coupon.applied", { code: coupon.code }) });
    } else {
      setApplied(null); // a failed attempt never leaves a stale discount behind
      setCouponMsg({ tone: "error", text: t(`coupon.err.${result.ok ? "unknown" : result.reason}`) });
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = guestDetailsSchema.safeParse({
      name, phone, email, bookingForOther: forOther, stayingGuestName: stayingName, specialRequests: requests, acceptedTerms: terms,
    });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !next[key]) next[key] = t(issue.message as "err.name");
      }
      setErrors(next);
      // Move focus to the first problem so keyboard and screen-reader users land on it.
      setTimeout(() => document.querySelector<HTMLElement>("form [aria-invalid='true']")?.focus(), 0);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const booking = createBooking({
      status: INITIAL_STATUS, mode,
      stayId: ctx.stay.id, stayName: ctx.stay.name, stayPhone: ctx.stay.phone, roomId: ctx.room.id, roomName: ctx.room.name,
      stayType: ctx.stayType, sessionHours: ctx.stayType === "session" ? ctx.sessionHours : undefined, guestType: ctx.guestType,
      checkIn: ctx.checkIn, checkOut: ctx.checkOut, adults: ctx.adults, children: ctx.children, rooms: ctx.rooms,
      guest: { name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email, bookingForOther: parsed.data.bookingForOther, stayingGuestName: parsed.data.stayingGuestName || undefined },
      specialRequests: parsed.data.specialRequests || undefined, couponCode: applied?.code, refundable: ctx.room.refundable, price,
    });
    router.push(`/${locale}/bookings/${booking.ref}`);
  }

  const dateText = overnight ? `${formatDate(ctx.checkIn, false, locale)} → ${formatDate(ctx.checkOut, false, locale)}` : formatDate(ctx.checkIn, false, locale);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-8">
        <section aria-labelledby="who" className="flex flex-col gap-4">
          <h2 id="who" className="type-heading">{t("review.who")}</h2>
          <Field label={t("review.name")} error={errors.name} required>
            {({ id, describedBy, invalid }) => <Input id={id} value={name} autoComplete="name" onChange={(e) => { setName(e.target.value); clear("name"); }} aria-describedby={describedBy} invalid={invalid} />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("review.phone")} error={errors.phone} hint={t("review.phoneHint")} required>
              {({ id, describedBy, invalid }) => <Input id={id} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clear("phone"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
            <Field label={t("review.email")} error={errors.email} required>
              {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clear("email"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
          </div>
          <Checkbox label={t("review.forOther")} checked={forOther} onChange={(e) => setForOther(e.target.checked)} />
          {forOther ? (
            <Field label={t("review.stayingName")} error={errors.stayingGuestName} required>
              {({ id, describedBy, invalid }) => <Input id={id} value={stayingName} onChange={(e) => { setStayingName(e.target.value); clear("stayingGuestName"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
          ) : null}
          <Field label={t("review.requests")} hint={t("review.requestsHint")} error={errors.specialRequests}>
            {({ id, describedBy, invalid }) => <Textarea id={id} rows={3} value={requests} onChange={(e) => { setRequests(e.target.value); clear("specialRequests"); }} aria-describedby={describedBy} invalid={invalid} />}
          </Field>
        </section>

        <section aria-labelledby="coupon" className="flex flex-col gap-3">
          <h2 id="coupon" className="type-heading">{t("coupon.title")}</h2>
          <div className="flex gap-2">
            <div className="flex-1">
              <Field label={t("coupon.code")}>
                {({ id }) => <Input id={id} value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" autoCapitalize="characters" />}
              </Field>
            </div>
            <Button variant="secondary" className="self-end" onClick={onApplyCoupon} disabled={!code.trim()}>{t("coupon.apply")}</Button>
          </div>
          {couponMsg ? <StatusBanner tone={couponMsg.tone}>{couponMsg.text}</StatusBanner> : null}
          <p className="type-body-sm text-text-secondary">{t("coupon.mockNote")}</p>
        </section>

        <HowYoullPay mode={mode} price={price} />

        <section aria-labelledby="policies" className="flex flex-col gap-3">
          <h2 id="policies" className="type-heading">{t("review.policies")}</h2>
          <ul className="type-body flex list-disc flex-col gap-2 pl-5 text-text-secondary">
            <li>{t("policy.times", { in: ctx.stay.checkIn, out: ctx.stay.checkOut })}</li>
            <li>{t(ctx.room.refundable ? "policy.cancel.refundable" : "policy.cancel.nonRefundable")}</li>
            <li>{t(mode === "pay_at_hotel" ? "policy.pay.cash" : "policy.pay.deposit")}</li>
            <li>{t("policy.cancelByPhone")}</li>
            <li>{t("policy.changeDates")}</li>
          </ul>
          <Checkbox label={t("review.terms")} checked={terms} onChange={(e) => { setTerms(e.target.checked); clear("acceptedTerms"); }} error={errors.acceptedTerms} />
        </section>

        <div className="flex flex-col gap-3">
          {/* Mobile: the total stays visible next to the commitment button. */}
          <div className="flex items-baseline justify-between rounded-field bg-surface-subtle p-3 lg:hidden">
            <span className="type-label">{t("price.total")}</span>
            <span className="type-price-md">{formatKs(price.total)}</span>
          </div>
          <p className="type-body-sm text-text-secondary lg:hidden">
            {price.payNow > 0 ? t("price.payNowShort", { amount: formatKs(price.payNow) }) : t("price.payAtPropertyShort")}
          </p>
          <Button type="submit" size="lg" loading={submitting}>{t("review.submit")}</Button>
          <p className="type-body-sm text-text-secondary">{t(mode === "pay_at_hotel" ? "review.afterCash" : "review.afterDeposit")}</p>
        </div>
      </div>

      <aside aria-label={t("review.summary")} className="flex h-fit flex-col gap-4 rounded-card border border-border-subtle bg-surface-raised p-5 shadow-raised lg:sticky lg:top-6">
        <div>
          <p className="type-body-sm text-text-secondary">{ctx.stay.name}</p>
          <h2 className="type-subheading">{ctx.room.name}</h2>
          <div className="mt-2"><PaymentModeBadge mode={mode} depositPct={depositPct} /></div>
          <p className="type-body-sm mt-1 text-text-secondary">{dateText}</p>
          <p className="type-body-sm text-text-secondary">
            {t(`stayType.${ctx.stayType}`)}{ctx.stayType === "session" ? ` · ${t("stayType.hours", { n: ctx.sessionHours })}` : ""} · {t(ctx.guestType === "foreigner" ? "price.foreignerRate" : "price.localRate")}
          </p>
          <p className="type-body-sm text-text-secondary">{guestSummaryText(t, ctx.adults + ctx.children, ctx.rooms)}</p>
        </div>
        <PriceBreakdown price={price} />
      </aside>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  applyCoupon, computePrice, formatDate, formatKs, INITIAL_STATUS, nightsBetween, rateFor,
  type GuestType, type PaymentMode, type Room, type StayType, type SessionHours, stayWindow, type WindowPolicies,
} from "@/domain";
import { ASSUMED_PRICING_RULES } from "@/config/pricing";
import { dataLabel } from "@/i18n/dataLabels";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { createBooking } from "@/services/bookings.service";
import { findCoupon } from "@/services/coupons.service";
import { guestSummaryText } from "@/shared/lib/guestSummary";
import { useMockSession } from "@/shared/hooks/useMockSession";
import { useStore } from "@/shared/hooks/useStore";
import { profileStore } from "@/services/profile.service";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";
import { Button } from "@/shared/ui/Button";
import { Checkbox, Field, Input, Textarea } from "@/shared/ui/Field";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { guestDetailsSchema } from "@/validation/booking";
import { HowYoullPay } from "./HowYoullPay";
import { PriceBreakdown } from "./PriceBreakdown";

export interface ReviewContext {
  stay: { id: string; name: string; place: { region: string; city: string; township?: string }; coords: { lat: number; lng: number }; phone: string; checkIn: string; checkOut: string; payment: { mode: PaymentMode; depositPct?: number } };
  room: Room;
  /** Every room type in this booking and how many of each. `room` is the first one. */
  lines: { room: Room; qty: number }[];
  stayType: StayType;
  sessionHours: SessionHours;
  startTime?: string;
  endTime?: string;
  policies: WindowPolicies;
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
  const profile = useStore(profileStore);
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
  const [prefilled, setPrefilled] = useState(false);
  const sheet = useRef<HTMLDialogElement>(null);

  // Signed-in guests do not retype what the account already knows. Only empty fields are filled, so nothing typed is overwritten.
  useEffect(() => {
    const n = profile.name?.trim();
    const ph = profile.phone?.trim() || session?.phone;
    const em = session?.email;
    if (!n && !ph && !em) return;
    setName((v) => v || n || "");
    setPhone((v) => v || ph || "");
    setEmail((v) => v || em || "");
    setPrefilled(Boolean(n || ph));
  }, [profile.name, profile.phone, session?.email, session?.phone]);
  const clear = (k: keyof Errors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const items = ctx.lines.map((l) => ({ label: l.room.name, unitRate: rateFor(l.room, ctx.stayType, ctx.guestType) ?? 0, rooms: l.qty }));
  const rate = items[0]?.unitRate ?? 0;
  const roomName = ctx.lines.map((l) => `${l.qty} × ${l.room.name}`).join(" + ");
  const refundable = ctx.lines.every((l) => l.room.refundable);
  const nights = Math.max(1, nightsBetween(ctx.checkIn, ctx.checkOut));
  const overnight = ctx.stayType === "overnight";
  const win = stayWindow(ctx.stayType, ctx.policies, ctx.startTime, ctx.sessionHours, ctx.endTime);

  const price = useMemo(
    () => computePrice({ unitRate: rate, nights, rooms: ctx.rooms, items, stayType: ctx.stayType, discount: applied?.discount, mode, depositPct, rules: ASSUMED_PRICING_RULES }),
    [rate, items, nights, ctx.rooms, ctx.stayType, applied, mode, depositPct],
  );

  /** Demo helper: fills the guest details, a sample request, the sample coupon code and the terms so the whole booking can be tried without typing. */
  function fillDemo() {
    setName("Aye Mon");
    setPhone("09123456789");
    setEmail((e) => e || "aye.mon@example.com");
    setForOther(false);
    setStayingName("");
    setRequests("Late check-in around 9 pm, please.");
    setCode("WELCOME10");
    setTerms(true);
    setErrors({});
  }

  // Open the page with ?demo=1 to land on a fully filled form.
  useEffect(() => { if (new URLSearchParams(window.location.search).get("demo") === "1") fillDemo(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onApplyCoupon() {
    const subtotal = computePrice({ unitRate: rate, nights, rooms: ctx.rooms, items, stayType: ctx.stayType, mode, depositPct, rules: ASSUMED_PRICING_RULES }).subtotal;
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
      stayId: ctx.stay.id, stayName: ctx.stay.name, stayPhone: ctx.stay.phone, roomId: ctx.room.id, roomName,
      stayType: ctx.stayType, sessionHours: ctx.stayType === "session" ? ctx.sessionHours : undefined, startTime: win?.start, endTime: win?.end, endsNextDay: win?.nextDay, guestType: ctx.guestType,
      checkIn: ctx.checkIn, checkOut: ctx.checkOut, adults: ctx.adults, children: ctx.children, rooms: ctx.rooms,
      guest: { name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email, bookingForOther: parsed.data.bookingForOther, stayingGuestName: parsed.data.stayingGuestName || undefined },
      specialRequests: parsed.data.specialRequests || undefined, couponCode: applied?.code, refundable, price,
    });
    // Remember the details for next time (only what the account does not have yet).
    if (!profile.name || !profile.phone) profileStore.set({ ...profile, name: profile.name || parsed.data.name, phone: profile.phone || parsed.data.phone });
    router.push(`/${locale}/bookings/${booking.ref}`);
  }

  const dateText = overnight ? `${formatDate(ctx.checkIn, false, locale)} → ${formatDate(ctx.checkOut, false, locale)}` : formatDate(ctx.checkIn, false, locale);

  const summary = (
    <>
        <div>
          <h2 className="type-heading">{ctx.stay.name}</h2>
          <p className="type-body-sm mt-1 flex items-start gap-1.5 text-text-secondary">
            <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.100-7-11.500a7 7 0 0 1 14 0C19 14.900 12 21 12 21Z" /><circle cx="12" cy="9.500" r="2.500" /></svg>
            <span>{[ctx.stay.place.township, ctx.stay.place.city, ctx.stay.place.region].filter(Boolean).map((x) => dataLabel(locale, x as string)).join(", ")}</span>
          </p>
          <ul className="mt-4 flex flex-col gap-0.5">{ctx.lines.map((l) => <li key={l.room.id} className="type-label">{l.qty} × {l.room.name}</li>)}</ul>
          <p className="type-body-sm mt-1 text-text-secondary">{dateText}</p>
          {win ? <p className="type-body-sm text-text-secondary">{t(win.nextDay ? "stayType.endsNextDay" : "stayType.ends", { start: win.start, end: win.end })}</p> : null}
          <p className="type-body-sm text-text-secondary">
            {t(`stayType.${ctx.stayType}`)}{ctx.stayType === "session" ? ` · ${t("stayType.hours", { n: ctx.sessionHours })}` : ""} · {t(ctx.guestType === "foreigner" ? "price.foreignerRate" : "price.localRate")}
          </p>
          <p className="type-body-sm text-text-secondary">{guestSummaryText(t, ctx.adults + ctx.children, ctx.rooms)}</p>
        </div>
        <div><PaymentModeBadge mode={mode} depositPct={depositPct} /></div>
        <PriceBreakdown price={price} />
    </>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 pb-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:pb-0">
      <div className="flex flex-col gap-8">
        <section aria-labelledby="who" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="who" className="type-heading">{t("review.who")}</h2>
            <Button type="button" variant="secondary" onClick={fillDemo}>{t("partner.fillDemo")}</Button>
          </div>
          {prefilled ? <p className="type-body-sm -mt-2 text-text-secondary">{t("review.prefilled")}</p> : null}
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
            <li>{t(refundable ? "policy.cancel.refundable" : "policy.cancel.nonRefundable")}</li>
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

      {/* Wide screens: the summary sits beside the form. */}
      <aside aria-label={t("review.summary")} className="hidden h-fit flex-col gap-4 rounded-card border border-border-subtle bg-surface-raised p-5 shadow-raised lg:sticky lg:top-6 lg:flex">
        {summary}
      </aside>

      {/* Phones: the same summary opens from a slim bar at the bottom, so it is one tap away instead of buried under the form. */}
      <div data-bottom-bar className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border-subtle bg-surface-raised px-[var(--gutter)] py-3 lg:hidden">
        <div className="min-w-0">
          <p className="type-body-sm text-text-secondary">{t("price.total")}</p>
          <p className="type-price-md">{formatKs(price.total)}</p>
        </div>
        <Button type="button" variant="secondary" aria-haspopup="dialog" onClick={() => sheet.current?.showModal()}>
          {t("review.details")}
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6" /></svg>
        </Button>
      </div>
      <dialog
        ref={sheet} aria-label={t("review.summary")}
        onClick={(e) => { if (e.target === sheet.current) sheet.current?.close(); }}
        className="sheet-up fixed inset-x-0 bottom-0 top-auto m-0 max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-sheet bg-surface-raised p-0 text-text-primary shadow-high backdrop:bg-black/50 lg:hidden"
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="type-heading">{t("booking.yourStay")}</h2>
          <button type="button" aria-label={t("common.close")} onClick={() => sheet.current?.close()} className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="flex max-h-[calc(88dvh-4.5rem)] flex-col gap-4 overflow-y-auto px-5 pb-6 pt-3">{summary}</div>
      </dialog>
    </form>
  );
}

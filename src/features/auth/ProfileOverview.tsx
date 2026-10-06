"use client";

import { useMemo, useState } from "react";
import { formatDate, formatKs } from "@/domain";
import { LOCALE_LABEL } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { sessionLabel } from "@/services/auth.service";
import { claimedCouponsStore, favoritesStore } from "@/services/preferences.service";
import { defaultName, profileStore } from "@/services/profile.service";
import { submittedReviewsStore } from "@/services/reviews.service";
import { stayCover } from "@/features/stay-detail/photos";
import { StatusBadge } from "@/features/bookings/StatusBadge";
import { LocalLink } from "@/shared/components/LocalLink";
import { NrcField } from "@/shared/components/NrcField";
import { useMockSession } from "@/shared/hooks/useMockSession";
import { useStore } from "@/shared/hooks/useStore";
import { Button, LinkButton } from "@/shared/ui/Button";
import { Field, Input, Select } from "@/shared/ui/Field";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { EmptyState } from "@/shared/ui/States";

const COUNTRIES = ["MM", "TH", "SG", "CN", "JP", "KR", "IN", "US", "GB", "AU"];

function countryName(code: string, locale: string): string {
  try { return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code; } catch { return code; }
}

const card = "rounded-card border border-border-subtle bg-surface-raised p-5 md:p-6";

/** The account home: who you are (editable), rewards, a one-glance summary and your latest bookings. */
export function ProfileOverview() {
  const t = useT();
  const locale = useLocale();
  const session = useMockSession();
  const profile = useStore(profileStore);
  const bookings = useStore(bookingsStore);
  const coupons = useStore(claimedCouponsStore).length;
  const saved = useStore(favoritesStore).length;
  const reviews = useStore(submittedReviewsStore).length;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [done, setDone] = useState(false);

  const name = profile.name || defaultName(session?.email, session?.phone);
  const country = profile.country ?? "MM";
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const recent = useMemo(() => bookings.slice(0, 3), [bookings]);

  const startEdit = () => { setDraft({ name, phone: profile.phone ?? session?.phone ?? "", country, nrc: profile.nrc ?? "", address: profile.address ?? "" }); setDone(false); setEditing(true); };
  const save = () => { profileStore.set({ ...draft, name: draft.name?.trim() ?? "", phone: draft.phone?.trim() ?? "", nrc: draft.nrc?.trim() ?? "", address: draft.address?.trim() ?? "" }); setEditing(false); setDone(true); };

  const fact = (label: string, value: string) => (
    <div className="min-w-0">
      <dt className="type-body-sm text-text-secondary">{label}</dt>
      <dd className="type-label mt-0.5 break-words">{value || <span className="font-normal text-text-muted">{t("profile.notSet")}</span>}</dd>
    </div>
  );

  const stats = [
    { n: bookings.length, label: t("profile.stat.bookings"), href: "/account/bookings", tint: "bg-surface-brand-subtle text-text-brand", icon: <><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" /></> },
    { n: saved, label: t("profile.stat.saved"), href: "/account/favorites", tint: "bg-error-bg text-error-text", icon: <path d="M12 20s-7-4.400-7-10a4 4 0 0 1 7-2.600A4 4 0 0 1 19 10c0 5.600-7 10-7 10Z" /> },
    { n: coupons, label: t("profile.stat.coupons"), href: "/account/promo-codes", tint: "bg-promo-bg text-promo-text", icon: <><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" /><path d="M14 6v12" strokeDasharray="2 2.500" /></> },
    { n: reviews, label: t("profile.stat.reviews"), href: "/account/reviews", tint: "bg-warning-bg text-warning-text", icon: <path d="m12 3.500 2.600 5.300 5.800.800-4.200 4.100 1 5.800L12 16.800 6.800 19.500l1-5.800-4.200-4.100 5.800-.800Z" /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="type-title">{t("profile.title")}</h1>
        <p className="type-body mt-2 text-text-secondary">{t("profile.subtitle")}</p>
      </header>

      <section aria-labelledby="pi" className={card}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="pi" className="type-heading">{t("profile.info")}</h2>
          {!editing ? (
            <Button variant="ghost" className="shrink-0 whitespace-nowrap" onClick={startEdit}>
              <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="m13.500 6.500 4 4" /></svg>
              {t("profile.edit")}
            </Button>
          ) : null}
        </div>

        {done ? <p role="status" className="type-body-sm mt-2 rounded-field bg-success-bg px-3 py-2 text-success-text">{t("profile.saved")}</p> : null}

        <div className="mt-5 flex flex-col gap-6 sm:flex-row">
          <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-2xl font-semibold text-text-brand sm:size-28 sm:text-4xl">{initial}</span>
          {!editing ? (
            <dl className="grid flex-1 gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
              {fact(t("profile.name"), name)}
              {fact(t("profile.email"), session?.email ?? "")}
              {fact(t("profile.phone"), profile.phone || session?.phone || "")}
              {fact(t("profile.country"), countryName(country, locale))}
              {fact(t("profile.nrc"), profile.nrc ?? "")}
              {fact(t("profile.address"), profile.address ?? "")}
              {fact(t("profile.language"), LOCALE_LABEL[locale])}
              {fact(t("profile.currency"), "MMK (Kyat)")}
            </dl>
          ) : (
            <form className="grid flex-1 gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
              <Field label={t("profile.name")}>{({ id }) => <Input id={id} value={draft.name ?? ""} autoComplete="name" onChange={(e) => setDraft({ ...draft, name: e.target.value })} />}</Field>
              <Field label={t("profile.email")} hint={session ? t("profile.signInMethod", { method: session.method }) : undefined}>{({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={session?.email ?? ""} disabled readOnly />}</Field>
              <Field label={t("profile.phone")}>{({ id }) => <Input id={id} type="tel" inputMode="tel" autoComplete="tel" value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />}</Field>
              <Field label={t("profile.country")}>
                {({ id }) => (
                  <Select id={id} value={draft.country ?? "MM"} onChange={(e) => setDraft({ ...draft, country: e.target.value, nrc: "" })}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{countryName(c, locale)}</option>)}
                  </Select>
                )}
              </Field>
              {(draft.country ?? "MM") === "MM" ? (
                <NrcField label={t("profile.nrc")} hint={t("flow.optionalHint")} value={draft.nrc ?? ""} onChange={(v) => setDraft({ ...draft, nrc: v })} className="sm:col-span-2" />
              ) : (
                <Field label={t("profile.passport")}>{({ id }) => <Input id={id} autoComplete="off" value={draft.nrc ?? ""} onChange={(e) => setDraft({ ...draft, nrc: e.target.value })} />}</Field>
              )}
              <Field label={t("profile.address")} className="sm:col-span-2">{({ id }) => <Input id={id} autoComplete="street-address" value={draft.address ?? ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />}</Field>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <Button type="submit">{t("profile.save")}</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>{t("profile.cancel")}</Button>
              </div>
            </form>
          )}
        </div>
        <p className="type-body-sm mt-5 text-text-secondary">{t("account.mock")}</p>

        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-card border border-[#bae6fd] bg-gradient-to-br from-[#e0f2fe] via-[#f0f9ff] to-surface-raised p-5">
          <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute -right-4 -top-6 size-32 text-brand opacity-[0.07]" fill="currentColor"><path d="m12 2 2.400 6.600L21 11l-6.600 2.400L12 20l-2.400-6.600L3 11l6.600-2.400Z" /></svg>
          <div className="relative flex items-center gap-4">
            <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-raised text-text-brand shadow-card ring-1 ring-[#bae6fd]">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7M7.500 8a2.500 2.500 0 0 1 0-5C11 3 12 8 12 8s1-5 4.500-5a2.500 2.500 0 0 1 0 5" /></svg>
            </span>
            <div>
              <p className="type-subheading">{t("profile.rewards")}</p>
              <p className="type-body-sm mt-0.5 max-w-md text-text-secondary">{t("profile.rewardsBody")}</p>
            </div>
          </div>
          <LinkButton href="/account/promo-codes?tab=all" className="relative">{t("profile.browseDeals")}</LinkButton>
        </div>
      </section>

      <section aria-labelledby="as" className={card}>
        <h2 id="as" className="type-heading">{t("profile.summary")}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-field bg-border-subtle lg:grid-cols-4">
          {stats.map((s) => (
            <li key={s.href} className="bg-surface-raised">
              <LocalLink href={s.href} className="group flex h-full items-center gap-3 p-4 transition-colors hover:bg-surface-subtle">
                <span aria-hidden className={`flex size-11 shrink-0 items-center justify-center rounded-full ${s.tint}`}>
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="type-heading block leading-none">{s.n}</span>
                  <span className="type-body-sm mt-1 block text-text-secondary">{s.label}</span>
                </span>
                <span aria-hidden className="text-text-secondary transition-transform group-hover:translate-x-0.5">›</span>
              </LocalLink>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rb" className={card}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="rb" className="type-heading">{t("profile.recent")}</h2>
          {bookings.length > 0 ? <LocalLink href="/account/bookings" className="type-label text-text-link underline-offset-4 hover:underline">{t("profile.viewAll")} →</LocalLink> : null}
        </div>
        {recent.length === 0 ? (
          <div className="mt-4"><EmptyState title={t("profile.noBookings")} body={t("profile.noBookingsBody")} action={<LinkButton href="/search">{t("nav.stays")}</LinkButton>} /></div>
        ) : (
          <ul className="mt-2 divide-y divide-border-subtle">
            {recent.map((b) => (
              <li key={b.ref}>
                <LocalLink href={`/bookings/${b.ref}`} className="group -mx-2 flex items-center gap-4 rounded-field px-2 py-4 hover:bg-surface-subtle">
                  <PhotoTile src={stayCover(b.stayId)} alt="" className="size-16 shrink-0 rounded-field sm:size-20" />
                  <div className="min-w-0 flex-1">
                    <p className="type-subheading truncate">{b.stayName}</p>
                    <p className="type-body-sm truncate text-text-secondary">{b.roomName}</p>
                    <p className="type-body-sm text-text-secondary">{formatDate(b.checkIn, true, locale)}{b.stayType === "overnight" ? ` – ${formatDate(b.checkOut, true, locale)}` : ""} · {b.ref}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5"><StatusBadge status={b.status} /><span className="type-price-sm">{formatKs(b.price.total)}</span></div>
                  <span aria-hidden className="text-text-secondary transition-transform group-hover:translate-x-0.5">›</span>
                </LocalLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

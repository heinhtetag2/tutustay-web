"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { DELETION_GRACE_DAYS, requestDeletion, sessionLabel, signOut } from "@/services/auth.service";
import { claimedCouponsStore, favoritesStore } from "@/services/preferences.service";
import { submittedReviewsStore } from "@/services/reviews.service";
import { enquiriesStore } from "@/services/support.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useMockSession } from "@/shared/hooks/useMockSession";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { StatusBanner } from "@/shared/ui/StatusBanner";

export function AccountOverview() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const session = useMockSession();
  const counts = {
    bookings: useStore(bookingsStore).length,
    coupons: useStore(claimedCouponsStore).length,
    reviews: useStore(submittedReviewsStore).length,
    saved: useStore(favoritesStore).length,
    enquiries: useStore(enquiriesStore).length,
  };
  const [confirming, setConfirming] = useState(false);
  const card = "flex items-center justify-between gap-3 rounded-card border border-border-subtle bg-surface-raised p-4 shadow-card hover:shadow-raised";
  const rows: [string, string, number][] = [
    ["/account/bookings", t("nav.myBookings"), counts.bookings],
    ["/account/favorites", t("fav.title"), counts.saved],
    ["/account/promo-codes", t("nav.myCoupons"), counts.coupons],
    ["/account/reviews", t("account.reviews"), counts.reviews],
    ["/account/support/inquiries", t("enquiry.mine"), counts.enquiries],
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-border-subtle bg-surface-raised p-5">
        <p className="type-label">{t("account.signedInAs")}</p>
        <p className="type-body">{session ? sessionLabel(session) : ""}</p>
        <p className="type-body-sm mt-1 text-text-secondary">{t("account.mock")}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map(([href, label, n]) => (
          <li key={href}><LocalLink href={href} className={card}><span className="type-subheading">{label}</span><span className="type-body-sm text-text-secondary">{n}</span></LocalLink></li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => { signOut(); router.push(`/${locale}`); }}>{t("nav.signOut")}</Button></div>

      <section className="rounded-card border border-border-subtle bg-surface-raised p-5" aria-labelledby="del">
        <h2 id="del" className="type-subheading">{t("account.delete.title")}</h2>
        {!confirming ? (
          <>
            <p className="type-body-sm mt-1 text-text-secondary">{t("account.delete.body", { days: DELETION_GRACE_DAYS })}</p>
            <Button variant="secondary" className="mt-3" onClick={() => setConfirming(true)}>{t("account.delete.start")}</Button>
          </>
        ) : (
          <div role="alertdialog" aria-labelledby="del-q" className="mt-3 flex flex-col gap-3">
            <p id="del-q" className="type-body">{t("account.delete.confirmQ")}</p>
            <StatusBanner tone="warning">{t("account.delete.consequence", { days: DELETION_GRACE_DAYS })}</StatusBanner>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => { requestDeletion(); router.push(`/${locale}/login`); }}>{t("account.delete.confirm")}</Button>
              <Button variant="secondary" onClick={() => setConfirming(false)}>{t("account.delete.keep")}</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

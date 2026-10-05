"use client";

import { formatKs } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { listCoupons } from "@/services/coupons.service";
import { claimedCouponsStore, favoritesStore } from "@/services/preferences.service";
import { submittedReviewsStore } from "@/services/reviews.service";
import { findStaysByIds } from "@/services/mocks/staysLookup";
import { LocalLink } from "@/shared/components/LocalLink";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useStore } from "@/shared/hooks/useStore";
import { FavoriteButton } from "@/features/search/FavoriteButton";
import { LinkButton } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState } from "@/shared/ui/States";

export function FavoritesList() {
  const t = useT();
  const hydrated = useHydrated();
  const stays = findStaysByIds(useStore(favoritesStore));
  if (!hydrated) return <Skeleton className="h-40 w-full" />;
  if (stays.length === 0) return <EmptyState title={t("fav.empty.title")} body={t("fav.empty.body")} action={<LinkButton href="/search">{t("nav.stays")}</LinkButton>} />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {stays.map((s) => (
        <li key={s.id} className="relative rounded-card border border-border-subtle bg-surface-raised p-4">
          <LocalLink href={`/stays/${s.id}`} className="block pr-10"><p className="type-body-sm text-text-secondary">{s.place.township ?? s.place.city}, {s.place.city}</p><h2 className="type-subheading">{s.name}</h2></LocalLink>
          <div className="absolute right-3 top-3"><FavoriteButton stayId={s.id} name={s.name} /></div>
        </li>
      ))}
    </ul>
  );
}

export function MyReviewsList() {
  const t = useT();
  const hydrated = useHydrated();
  const reviews = useStore(submittedReviewsStore);
  const bookings = useStore(bookingsStore);
  if (!hydrated) return <Skeleton className="h-40 w-full" />;
  if (reviews.length === 0) return <EmptyState title={t("myreviews.empty.title")} body={t("myreviews.empty.body")} />;
  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li key={r.bookingRef} className="rounded-card border border-border-subtle bg-surface-raised p-4">
          <p className="type-subheading">{bookings.find((b) => b.ref === r.bookingRef)?.stayName ?? r.bookingRef} · {r.rating}/5</p>
          {r.text ? <p className="type-body mt-1">{r.text}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function PromoCodesList() {
  const t = useT();
  const hydrated = useHydrated();
  const claimed = useStore(claimedCouponsStore);
  if (!hydrated) return <Skeleton className="h-40 w-full" />;
  const mine = listCoupons().filter((c) => claimed.includes(c.code));
  if (mine.length === 0) return <EmptyState title={t("promo.empty.title")} body={t("promo.empty.body")} action={<LinkButton href="/deals">{t("nav.deals")}</LinkButton>} />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {mine.map((c) => (
        <li key={c.code} className="rounded-card bg-promo-bg p-4">
          <h2 className="type-subheading text-promo-text">{c.title}</h2>
          <p className="type-price-sm mt-1">{c.code}</p>
          <p className="type-body-sm mt-1">{c.minSpend ? t("deals.minSpend", { amount: formatKs(c.minSpend) }) : t("deals.noMin")} · {t("deals.expires", { date: c.expires })}</p>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { lowestRate, stayTypesOffered } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { favoritesStore } from "@/services/preferences.service";
import { submittedReviewsStore } from "@/services/reviews.service";
import { findStaysByIds } from "@/services/mocks/staysLookup";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useStore } from "@/shared/hooks/useStore";
import { ResultCard } from "@/features/search/ResultCard";
import type { StaySummary } from "@/services/stays.service";
import { LinkButton } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState } from "@/shared/ui/States";

export function FavoritesList() {
  const t = useT();
  const locale = useLocale();
  const hydrated = useHydrated();
  const stays = findStaysByIds(useStore(favoritesStore));
  if (!hydrated) return <Skeleton className="h-40 w-full" />;
  if (stays.length === 0) return <EmptyState title={t("fav.empty.title")} body={t("fav.empty.body")} action={<LinkButton href="/search">{t("nav.stays")}</LinkButton>} />;
  // The same photo cards as the search results, priced for one night for a local guest (no dates are chosen here).
  const items: StaySummary[] = stays.map((stay) => {
    const fromRate = lowestRate(stay.rooms, "overnight", "local");
    return { stay, fromRate, available: fromRate !== null, offered: stayTypesOffered(stay.rooms) };
  });
  return (
    <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query="" stayType="overnight" foreigner={false} layout="card" />)}
    </ul>
  );
}

/** DEMO: sample reviews so the page isn't empty before a guest has completed a stay. Replace with real data when a backend exists. */
const DEMO_REVIEWS = [
  { ref: "demo-1", stayName: "Shwe Pann Hotel", rating: 5, when: "September 2026", text: "Clean room, friendly front desk and easy to find. Would stay again." },
  { ref: "demo-2", stayName: "Inya Lakeside Guest House", rating: 4, when: "August 2026", text: "Fair price and a short walk to food. The family running it were kind and helpful." },
  { ref: "demo-3", stayName: "Ngapali Palm Resort", rating: 5, when: "June 2026", text: "Beautiful beach, relaxed staff and a great breakfast. Perfect for a daycation." },
];

export function MyReviewsList() {
  const hydrated = useHydrated();
  const reviews = useStore(submittedReviewsStore);
  const bookings = useStore(bookingsStore);
  if (!hydrated) return <Skeleton className="h-40 w-full" />;
  const mine = reviews.map((r) => ({ ref: r.bookingRef, stayName: bookings.find((b) => b.ref === r.bookingRef)?.stayName ?? r.bookingRef, rating: r.rating, when: "", text: r.text }));
  return (
    <ul className="flex flex-col gap-3">
      {[...mine, ...DEMO_REVIEWS].map((r) => (
        <li key={r.ref} className="rounded-card border border-border-subtle bg-surface-raised p-4">
          <p className="type-subheading">{r.stayName} · {r.rating}/5</p>
          {r.when ? <p className="type-body-sm text-text-secondary">{r.when}</p> : null}
          {r.text ? <p className="type-body mt-1">{r.text}</p> : null}
        </li>
      ))}
    </ul>
  );
}

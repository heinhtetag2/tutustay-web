"use client";

import { useEffect, useRef, useState } from "react";
import { canReview, formatDate, lowestRate, stayTypesOffered } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { favoritesStore } from "@/services/preferences.service";
import { submittedReviewsStore } from "@/services/reviews.service";
import { findStaysByIds } from "@/services/mocks/staysLookup";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useStore } from "@/shared/hooks/useStore";
import { ResultCard } from "@/features/search/ResultCard";
import type { StaySummary } from "@/services/stays.service";
import { stayCover } from "@/features/stay-detail/photos";
import { ReviewForm } from "@/features/bookings/ReviewForm";
import { LocalLink } from "@/shared/components/LocalLink";
import { Button, LinkButton } from "@/shared/ui/Button";
import { PhotoTile } from "@/shared/ui/PhotoTile";
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
    <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2 sm:gap-y-8 xl:grid-cols-3">
      {items.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query="" stayType="overnight" foreigner={false} layout="compact" />)}
    </ul>
  );
}

/** DEMO: sample reviews so the page isn't empty before a guest has completed a stay. Replace with real data when a backend exists. */
const DEMO_REVIEWS = [
  { ref: "demo-1", stayName: "Shwe Pann Hotel", rating: 5, when: "September 2026", text: "Clean room, friendly front desk and easy to find. Would stay again." },
  { ref: "demo-2", stayName: "Inya Lakeside Guest House", rating: 4, when: "August 2026", text: "Fair price and a short walk to food. The family running it were kind and helpful." },
  { ref: "demo-3", stayName: "Ngapali Palm Resort", rating: 5, when: "June 2026", text: "Beautiful beach, relaxed staff and a great breakfast. Perfect for a daycation." },
];

type ReviewTab = "todo" | "written";

/** Reviews in two tabs: stays you have finished but not reviewed yet (write one right here), and the ones you already left. */
export function MyReviewsList() {
  const t = useT();
  const locale = useLocale();
  const hydrated = useHydrated();
  const reviews = useStore(submittedReviewsStore);
  const bookings = useStore(bookingsStore);
  const [tab, setTab] = useState<ReviewTab>("todo");
  const [openRef, setOpenRef] = useState<string | null>(null);
  const seen = useRef(reviews.length);

  // After a review is saved, show it in the Written tab.
  useEffect(() => {
    if (reviews.length > seen.current) { setTab("written"); setOpenRef(null); }
    seen.current = reviews.length;
  }, [reviews.length]);

  if (!hydrated) return <Skeleton className="h-40 w-full" />;
  const reviewed = new Set(reviews.map((r) => r.bookingRef));
  const todo = bookings.filter((b) => canReview(b, reviewed.has(b.ref)));
  const mine = reviews.map((r) => ({ ref: r.bookingRef, stayName: bookings.find((b) => b.ref === r.bookingRef)?.stayName ?? r.bookingRef, rating: r.rating, when: "", text: r.text }));
  const written = [...mine, ...DEMO_REVIEWS];

  const tabBtn = (id: ReviewTab, label: string, n: number) => (
    <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}
      className={`type-label min-h-11 px-4 ${tab === id ? "border-b-2 border-border-focus text-text-brand" : "text-text-secondary"}`}>
      {label} ({n})
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label={t("account.reviews")} className="flex gap-1 border-b border-border-subtle">
        {tabBtn("todo", t("reviews.tab.todo"), todo.length)}
        {tabBtn("written", t("reviews.tab.written"), written.length)}
      </div>

      {tab === "todo" ? (
        todo.length === 0 ? (
          <EmptyState title={t("reviews.todoEmpty.title")} body={t("reviews.todoEmpty.body")} />
        ) : (
          <ul role="tabpanel" className="flex flex-col gap-3">
            {todo.map((b) => {
              const open = openRef === b.ref;
              return (
                <li key={b.ref} className="rounded-card border border-border-subtle bg-surface-raised p-3 sm:p-4">
                  <div className="flex items-center gap-4">
                    <PhotoTile src={stayCover(b.stayId)} alt="" className="size-20 shrink-0 rounded-field sm:size-24" />
                    <div className="min-w-0 flex-1">
                      <p className="type-subheading truncate">{b.stayName}</p>
                      <p className="type-body-sm truncate text-text-secondary">{b.roomName}</p>
                      <p className="type-body-sm text-text-secondary">{t("reviews.stayed", { dates: `${formatDate(b.checkIn, true, locale)}${b.stayType === "overnight" ? ` – ${formatDate(b.checkOut, true, locale)}` : ""}` })}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <LocalLink href={`/bookings/${b.ref}`} className="type-label hidden text-text-link underline underline-offset-4 sm:inline">{t("reviews.viewBooking")}</LocalLink>
                      <Button variant={open ? "secondary" : "primary"} aria-expanded={open} onClick={() => setOpenRef(open ? null : b.ref)}>{open ? t("common.close") : t("reviews.write")}</Button>
                    </div>
                  </div>
                  {open ? <div className="mt-4"><ReviewForm booking={b} /></div> : null}
                </li>
              );
            })}
          </ul>
        )
      ) : written.length === 0 ? (
        <EmptyState title={t("myreviews.empty.title")} body={t("myreviews.empty.body")} />
      ) : (
        <ul role="tabpanel" className="flex flex-col gap-3">
          {written.map((r) => (
            <li key={r.ref} className="rounded-card border border-border-subtle bg-surface-raised p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="type-subheading">{r.stayName}</p>
                <span role="img" aria-label={`${r.rating}/5`} className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg key={n} aria-hidden viewBox="0 0 24 24" className={`size-5 ${n <= r.rating ? "text-[#f59e0b]" : "text-border-control"}`} fill="currentColor"><path d="m12 2.500 2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.300l-5.900 3.200 1.200-6.500L2.500 9.400l6.600-.9Z" /></svg>
                  ))}
                </span>
              </div>
              {r.when ? <p className="type-body-sm text-text-secondary">{r.when}</p> : null}
              {r.text ? <p className="type-body mt-1">{r.text}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

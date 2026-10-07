"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ratingLabel, type Stay } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import type { RvKey, TopicKey } from "@/services/mocks/reviewDemo";
import { demoReviewSummary } from "@/services/mocks/reviewDemo";
import { Section } from "@/shared/layout/Container";
import { RatingHero } from "@/shared/ui/RatingHero";

const Star = ({ on }: { on: boolean }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={`size-3.5 ${on ? "text-text-primary" : "text-border-subtle"}`} fill="currentColor"><path d="m8 1.200 2 4.300 4.600.600-3.400 3.200.9 4.600L8 11.600 3.900 13.900l.9-4.600L1.400 6.100 6 5.500Z" /></svg>
);

const TOPIC_ICONS: Record<TopicKey | RvKey, ReactNode> = {
  cleanliness: <><path d="M12 3l1.800 4.700L18.500 9.500l-4.700 1.800L12 16l-1.800-4.700L5.500 9.500l4.700-1.800Z" /><path d="M19 15v4M17 17h4" /></>,
  staff: <><circle cx="9" cy="8" r="3.500" /><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.500a3.500 3.500 0 0 1 0 7M18.500 14.500a6.500 6.500 0 0 1 3 5.500" /></>,
  location: <><path d="M12 21s-7-6.200-7-11.500a7 7 0 0 1 14 0C19 14.800 12 21 12 21Z" /><circle cx="12" cy="9.500" r="2.500" /></>,
  value: <><path d="M3 12V4h8l10 10-8 8Z" /><circle cx="7.500" cy="8.500" r="1.200" /></>,
  comfort: <><path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.800" /></>,
  checkin: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M16 7l3 3M14 9l2 2" /></>,
  breakfast: <><path d="M6 9h10v7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z" /><path d="M16 11h1.500a2 2 0 0 1 0 4H16M9 3.500c0 1 1 1 1 2M12.500 3.500c0 1 1 1 1 2" /></>,
  quiet: <path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500Z" />,
  view: <><path d="m3 19 6-10 4 6 2-3 6 7Z" /><circle cx="17" cy="6" r="2" /></>,
};
const TopicIcon = ({ name, className = "size-4" }: { name: TopicKey | RvKey; className?: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{TOPIC_ICONS[name]}</svg>
);

type ReviewData = ReturnType<typeof demoReviewSummary>["cards"][number];

function ReviewCard({ c, clamp = true }: { c: ReviewData; clamp?: boolean }) {
  const t = useT();
  return (
    <li className="flex gap-4">
      <img src={c.avatar} alt="" loading="lazy" className="size-10 shrink-0 rounded-full object-cover" />
      <div className="min-w-0">
        <p className="type-label">{c.author}</p>
        <p className="type-body-sm text-text-secondary">{t("review.verified", { when: c.when })}</p>
        <span className="mt-1.5 inline-flex items-center gap-0.5" role="img" aria-label={`${c.score}/5`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} on={n <= c.score} />)}</span>
        <p className={`type-body-sm mt-2 ${clamp ? "line-clamp-4" : ""}`}>{c.text}</p>
      </div>
    </li>
  );
}

type Summary = ReturnType<typeof demoReviewSummary>;

function Distribution({ r }: { r: Summary }) {
  const t = useT();
  return (
    <ul className="flex flex-col gap-3" aria-label={t("rv.overall")}>
      {r.distribution.map((pct, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="type-body-sm w-14 shrink-0 text-text-primary">{t(5 - i === 1 ? "rv.star" : "rv.stars", { n: 5 - i })}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-subtle"><span className="block h-full rounded-full bg-text-primary" style={{ width: `${pct}%` }} /></span>
          <span className="type-body-sm w-10 shrink-0 text-right tabular-nums text-text-primary">{pct}%</span>
        </li>
      ))}
    </ul>
  );
}

function Categories({ r }: { r: Summary }) {
  const t = useT();
  return (
    <ul className="flex flex-col">
      {r.categories.slice(0, 4).map((c) => (
        <li key={c.key} className="flex items-center justify-between gap-4 border-b border-border-subtle py-2.5 first:pt-0 last:border-b-0 last:pb-0">
          <span className="type-body-sm flex items-center gap-3 text-text-primary"><TopicIcon name={c.key} className="size-[1.125rem]" />{t(`rv.${c.key}`)}</span>
          <span className="type-label tabular-nums">{c.score.toFixed(1)}</span>
        </li>
      ))}
    </ul>
  );
}

const SORTS = ["recent", "high", "low"] as const;

/** All reviews on their own full page (native <dialog>, covers the screen): rating panel on the left, searchable and sortable list on the right. */
function AllReviews({ open, onClose, stay, r }: { open: boolean; onClose: () => void; stay: Stay & { rating: NonNullable<Stay["rating"]> }; r: Summary }) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("recent");
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const q = query.trim().toLowerCase();
  const list = r.cards
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => !q || `${c.text} ${c.author}`.toLowerCase().includes(q))
    .sort((a, b) => (sort === "high" ? b.c.score - a.c.score : sort === "low" ? a.c.score - b.c.score : 0) || a.i - b.i)
    .map(({ c }) => c);
  const closeBtn = "inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-subtle bg-surface-raised hover:bg-surface-subtle";
  return (
    <dialog
      ref={ref} aria-label={t("stay.reviews")} onClose={onClose}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-surface-raised p-0 text-text-primary backdrop:bg-black/50"
    >
      {open ? (
        <div className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-8">
          <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between bg-surface-raised px-5 py-4 sm:-mx-8 sm:px-8">
            <button type="button" aria-label={t("common.close")} onClick={onClose} className={closeBtn}>
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            </button>
            <button type="button" aria-label={t("common.close")} onClick={onClose} className={closeBtn}>
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>

          <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
            <aside className="self-start overflow-hidden rounded-card border border-border-subtle lg:sticky lg:top-24">
              <div className="bg-surface-subtle px-6 py-8">
                <RatingHero score={stay.rating.score} label={t(`rating.${ratingLabel(stay.rating.score)}`)} basedOn={t("rv.basedOn", { n: stay.rating.count.toLocaleString() })} />
              </div>
              <div className="flex flex-col gap-8 p-6">
                <div>
                  <p className="type-subheading mb-4">{t("rv.overall")}</p>
                  <Distribution r={r} />
                </div>
                <div>
                  <p className="type-subheading mb-4">{t("rv.categories")}</p>
                  <Categories r={r} />
                </div>
              </div>
              <div className="border-t border-border-subtle p-6">
                <p className="type-subheading">{t("rv.trust")}</p>
                <p className="type-body-sm mt-1 text-text-secondary">{t("review.rule")}</p>
              </div>
            </aside>

            <div>
              <h2 className="type-title">{t("stay.reviews")}</h2>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">{t("rv.search")}</span>
                  <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.500" /><path d="m16 16 4.500 4.500" /></svg>
                  <input
                    type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("rv.search")}
                    className="type-body-sm min-h-12 w-full rounded-full border border-border-control bg-surface-raised pl-11 pr-4"
                  />
                </label>
                <label className="relative">
                  <span className="sr-only">{t("rv.sort")}</span>
                  <select
                    value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
                    className="type-label min-h-12 cursor-pointer appearance-none rounded-full border border-border-control bg-surface-raised pl-5 pr-10"
                  >
                    {SORTS.map((k) => <option key={k} value={k}>{t(`rv.sort.${k}`)}</option>)}
                  </select>
                  <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
                </label>
              </div>
              {list.length ? (
                <ul className="mt-8 flex flex-col divide-y divide-border-subtle [&>li]:py-7 [&>li:first-child]:pt-0">
                  {list.map((c) => <ReviewCard key={c.author} c={c} clamp={false} />)}
                </ul>
              ) : (
                <p className="type-body mt-10 text-text-secondary">{t("rv.noMatch")}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

/** Airbnb-style review block: overall score + star distribution, category scores, topics guests mention, review cards. Demo data. */
export function StayReviews({ stay }: { stay: Stay }) {
  const t = useT();
  const [all, setAll] = useState(false);
  if (!stay.rating) {
    return <Section divided id="reviews"><h2 className="type-heading mb-4">{t("stay.reviews")}</h2><p className="type-body text-text-secondary">{t("review.none")}</p></Section>;
  }
  const r = demoReviewSummary(stay);
  const cards = r.cards;
  const PREVIEW = 4;
  return (
    <Section divided id="reviews" className="pt-6 pb-6 md:pt-8 md:pb-8">
      <h2 className="type-heading mb-8 flex items-center gap-3">
        {t("stay.reviews")}
        <span className="type-body-sm rounded-full border border-border-subtle px-2.5 py-0.5 font-medium text-text-secondary">{stay.rating.count.toLocaleString()}</span>
      </h2>
      <div className="mb-10 border-b border-border-subtle pb-10">
        <RatingHero score={stay.rating.score} label={t(`rating.${ratingLabel(stay.rating.score)}`)} basedOn={t("rv.basedOn", { n: stay.rating.count.toLocaleString() })} />
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <p className="type-label mb-4">{t("rv.overall")}</p>
          <Distribution r={r} />
        </div>

        <div>
          <p className="type-label mb-4">{t("rv.categories")}</p>
          <Categories r={r} />
        </div>
      </div>

      <ul className="mt-12 grid gap-x-14 gap-y-10 border-t border-border-subtle pt-10 md:grid-cols-2">
        {cards.slice(0, PREVIEW).map((c) => <ReviewCard key={c.author} c={c} />)}
      </ul>
      <button
        type="button" onClick={() => setAll(true)} aria-haspopup="dialog"
        className="type-label mt-10 inline-flex min-h-12 cursor-pointer items-center rounded-full border border-border-control bg-surface-raised px-6 hover:bg-surface-subtle"
      >
        {t("rv.showAll", { n: stay.rating.count.toLocaleString() })}
      </button>
      <AllReviews open={all} onClose={() => setAll(false)} stay={stay as Stay & { rating: NonNullable<Stay["rating"]> }} r={r} />
    </Section>
  );
}

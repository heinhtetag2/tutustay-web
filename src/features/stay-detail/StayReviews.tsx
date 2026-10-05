"use client";

import { useState, type ReactNode } from "react";
import { ratingLabel, type Stay } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import type { RvKey, TopicKey } from "@/services/mocks/reviewDemo";
import { demoReviewSummary } from "@/services/mocks/reviewDemo";
import { Section } from "@/shared/layout/Container";
import { StatusBanner } from "@/shared/ui/StatusBanner";

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

/** Airbnb-style review block: overall score + star distribution, category scores, topics guests mention, review cards. Demo data. */
export function StayReviews({ stay }: { stay: Stay }) {
  const t = useT();
  const [topic, setTopic] = useState<TopicKey | null>(null);
  if (!stay.rating) {
    return <Section divided id="reviews"><h2 className="type-heading mb-4">{t("stay.reviews")}</h2><p className="type-body text-text-secondary">{t("review.none")}</p></Section>;
  }
  const r = demoReviewSummary(stay);
  const cards = topic ? r.cards.filter((c) => c.topics.includes(topic)) : r.cards;
  return (
    <Section divided id="reviews">
      <h2 className="type-heading mb-6 flex flex-wrap items-baseline gap-x-3">
        <span className="inline-flex items-center gap-2"><svg aria-hidden viewBox="0 0 16 16" className="size-5" fill="currentColor"><path d="m8 1.200 2 4.300 4.600.600-3.400 3.200.9 4.600L8 11.600 3.900 13.900l.9-4.600L1.400 6.100 6 5.500Z" /></svg>{stay.rating.score.toFixed(1)}</span>
        <span className="font-normal text-text-secondary">· {t("review.count", { n: stay.rating.count })}</span>
      </h2>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
        <div>
          <p className="type-label mb-3">{t("rv.overall")}</p>
          <p className="type-display">{stay.rating.score.toFixed(1)}</p>
          <p className="type-body-sm mb-4 text-text-secondary">{t(`rating.${ratingLabel(stay.rating.score)}`)}</p>
          <ul className="flex flex-col gap-2" aria-label={t("rv.overall")}>
            {r.distribution.map((pct, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="type-body-sm w-12 shrink-0 text-text-secondary">{t("rv.stars", { n: 5 - i })}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-subtle"><span className="block h-full rounded-full bg-text-primary" style={{ width: `${pct}%` }} /></span>
                <span className="type-body-sm w-9 shrink-0 text-right tabular-nums">{pct}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <p className="type-label mb-3">{t("rv.categories")}</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
              {r.categories.map((c) => (
                <li key={c.key} className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <span className="type-body-sm flex items-center gap-2 text-text-secondary"><TopicIcon name={c.key} />{t(`rv.${c.key}`)}</span>
                  <span className="type-label tabular-nums">{c.score.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="type-label mb-3">{t("rv.mention")}</p>
            <ul className="flex flex-wrap gap-2">
              {r.topics.map((x) => {
                const on = topic === x.key;
                return (
                  <li key={x.key}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTopic(on ? null : x.key)}
                      className={`type-body-sm inline-flex cursor-pointer select-none items-center gap-2 rounded-full border px-4 py-1.5 transition-colors ${on ? "border-text-primary bg-text-primary text-surface-raised" : "border-border-subtle bg-surface-raised hover:border-text-primary"}`}
                    >
                      <TopicIcon name={x.key} />{t(`rv.${x.key}`)} <span className={on ? "opacity-70" : "text-text-secondary"}>{x.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {topic && (
        <p className="type-body-sm mt-10 flex flex-wrap items-center gap-x-3 text-text-secondary" role="status">
          {t("rv.filtered", { n: cards.length, topic: t(`rv.${topic}`).toLowerCase() })}
          <button type="button" onClick={() => setTopic(null)} className="type-label cursor-pointer text-text-primary underline underline-offset-4">{t("rv.clear")}</button>
        </p>
      )}
      <ul className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2">
        {cards.map((c) => (
          <li key={c.author}>
            <div className="mb-3 flex items-center gap-3">
              <img src={c.avatar} alt="" loading="lazy" className="size-12 shrink-0 rounded-full object-cover" />
              <div>
                <p className="type-label">{c.author}</p>
                <p className="type-body-sm text-text-secondary">{t("review.verified", { when: c.when })}</p>
              </div>
            </div>
            <p className="mb-2 flex items-center gap-0.5" role="img" aria-label={`${c.score}/5`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} on={n <= c.score} />)}</p>
            <p className="type-body line-clamp-4">{c.text}</p>
          </li>
        ))}
      </ul>
      <StatusBanner tone="info" className="mt-10">{t("review.rule")}</StatusBanner>
    </Section>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { canReview, RATING_MAX, RATING_MIN, type Booking } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { submitReview, submittedReviewsStore } from "@/services/reviews.service";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { Field, Textarea } from "@/shared/ui/Field";
import { StatusBanner } from "@/shared/ui/StatusBanner";

/** Shown on a completed booking (BR-07). Mock: the review is stored in this browser only. */
export function ReviewForm({ booking }: { booking: Booking }) {
  const t = useT();
  const existing = useStore(submittedReviewsStore).find((r) => r.bookingRef === booking.ref);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();

  if (!canReview(booking, Boolean(existing)) && !existing) return null;
  if (existing) {
    return <StatusBanner tone="success" title={t("reviewForm.thanks")}>{t("reviewForm.thanksBody", { rating: existing.rating })}</StatusBanner>;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating < RATING_MIN) { setError(t("err.rating")); return; }
    submitReview({ bookingRef: booking.ref, rating, text: text.trim() });
  }

  return (
    <section className="rounded-card border border-border-subtle bg-surface-raised p-5" aria-labelledby="rv">
      <h2 id="rv" className="type-heading mb-1">{t("reviewForm.title")}</h2>
      <p className="type-body-sm mb-4 text-text-secondary">{t("review.rule")}</p>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <fieldset>
          <legend className="type-label mb-2">{t("reviewForm.rating")}</legend>
          <div className="flex gap-2">
            {Array.from({ length: RATING_MAX }, (_, i) => i + 1).map((n) => (
              <label key={n} className={`type-label flex size-11 cursor-pointer items-center justify-center rounded-full border ${rating === n ? "border-border-focus bg-surface-brand-subtle text-text-brand" : "border-border-control"}`}>
                <input type="radio" name="rating" value={n} className="sr-only" checked={rating === n} onChange={() => { setRating(n); setError(undefined); }} />
                <span aria-hidden>{n}</span><span className="sr-only">{t("reviewForm.stars", { n })}</span>
              </label>
            ))}
          </div>
          {error ? <p role="alert" className="type-body-sm mt-2 text-error-text">{error}</p> : null}
        </fieldset>
        <Field label={t("reviewForm.text")}>{({ id }) => <Textarea id={id} rows={3} value={text} onChange={(e) => setText(e.target.value)} />}</Field>
        <Button type="submit" className="self-start">{t("reviewForm.submit")}</Button>
      </form>
    </section>
  );
}

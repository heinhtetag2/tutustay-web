"use client";

import { useEffect, useRef } from "react";
import { formatKs, type PaymentMode } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { compareStore, MAX_COMPARE } from "@/services/preferences.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { PhotoTile } from "@/shared/ui/PhotoTile";

/** Plain, serialisable facts the comparison needs, prepared on the server from the current results. */
export interface CompareStay {
  id: string;
  name: string;
  cover?: string;
  href: string;
  categoryLabel: string;
  place: string;
  rating: { score: string; label: string; reviews: string } | null;
  fromRate: number | null;
  rateUnit: string;
  payment: { mode: PaymentMode; depositPct?: number };
  refundable: boolean;
  coupons: boolean;
  facilities: string[];
}

const Check = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-success-text" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
const Cross = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
);

/** Bottom tray while stays are picked, plus the side-by-side comparison dialog. */
export function CompareBar({ stays }: { stays: CompareStay[] }) {
  const t = useT();
  const picked = useStore(compareStore);
  const dialog = useRef<HTMLDialogElement>(null);
  const chosen = picked.map((id) => stays.find((s) => s.id === id)).filter((s): s is CompareStay => Boolean(s));
  const remove = (id: string) => compareStore.set(picked.filter((x) => x !== id));

  // Dropping below two stays closes the comparison.
  useEffect(() => { if (chosen.length < 2 && dialog.current?.open) dialog.current.close(); }, [chosen.length]);

  const facilities = [...new Set(chosen.flatMap((s) => s.facilities))];
  const cols = { gridTemplateColumns: `repeat(${chosen.length}, minmax(13rem, 1fr))` };

  return (
    <>
      {chosen.length > 0 ? (
        <div role="region" aria-label={t("compare.title")} className="anim-rise fixed inset-x-0 bottom-0 z-[1100] px-3 pb-3 sm:px-6">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-sheet bg-surface-raised shadow-high">
            <div className="flex items-center justify-between bg-action-primary px-5 py-3 text-text-on-action">
              <p className="type-subheading" aria-live="polite">{t("compare.selected", { n: chosen.length, max: MAX_COMPARE })}</p>
              {chosen.length < 2 ? <p className="type-body-sm hidden opacity-90 sm:block">{t("compare.hint")}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-4 p-4">
              <ul className="flex flex-1 gap-3">
                {Array.from({ length: MAX_COMPARE }, (_, i) => chosen[i]).map((s, i) => (
                  <li key={s?.id ?? `empty-${i}`} className="relative">
                    {s ? (
                      <>
                        <PhotoTile src={s.cover} alt={s.name} className="size-14 rounded-field sm:size-16" />
                        <button type="button" onClick={() => remove(s.id)} aria-label={t("compare.remove", { name: s.name })} className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-text-primary text-surface-raised shadow-raised">
                          <svg aria-hidden viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
                        </button>
                      </>
                    ) : <div aria-hidden className="size-14 rounded-field border border-dashed border-border-control sm:size-16" />}
                  </li>
                ))}
              </ul>
              <div className="flex w-full gap-3 sm:w-auto">
                <Button variant="secondary" size="lg" onClick={() => compareStore.set([])} className="flex-1 sm:flex-none">{t("compare.clear")}</Button>
                <Button size="lg" disabled={chosen.length < 2} onClick={() => dialog.current?.showModal()} className="flex-1 sm:flex-none">{t("compare.open")}</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Native <dialog>: focus is trapped, Escape closes, and focus returns to the opener. */}
      <dialog ref={dialog} aria-labelledby="compare-title" className="m-auto max-h-[90dvh] w-[min(72rem,calc(100vw-1.5rem))] max-w-none overflow-hidden rounded-sheet bg-surface-raised p-0 shadow-high backdrop:bg-black/60">
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex items-center gap-3 px-5 py-4">
            <button type="button" onClick={() => dialog.current?.close()} aria-label={t("common.close")} className="press inline-flex size-11 items-center justify-center rounded-full border border-border-control hover:bg-surface-subtle">
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <h2 id="compare-title" className="type-heading">{t("compare.title")}</h2>
          </div>
          <div className="overflow-auto px-5 pb-6">
            <div className="mx-auto overflow-hidden rounded-card border border-border-subtle" style={{ maxWidth: `${chosen.length * 22}rem` }}>
              <div className="grid divide-x divide-border-subtle" style={cols}>
                {chosen.map((s) => (
                  <section key={s.id} aria-label={s.name} className="flex flex-col divide-y divide-border-subtle">
                    <PhotoTile src={s.cover} alt={s.name} className="aspect-[3/2] w-full" />
                    <div className="p-4">
                      <h3 className="type-subheading">{s.name}</h3>
                      <p className="type-body-sm mt-1 text-text-secondary">{s.categoryLabel} · {s.place}</p>
                    </div>
                    <div className="flex min-h-20 items-center gap-3 p-4">
                      {s.rating ? (
                        <>
                          <span className="type-label rounded-control bg-success-bg px-2 py-1 font-semibold text-success-text">{s.rating.score}</span>
                          <div><p className="type-label">{s.rating.label}</p><p className="type-body-sm text-text-secondary">{s.rating.reviews}</p></div>
                        </>
                      ) : <span className="type-body-sm text-text-secondary">—</span>}
                    </div>
                    <div className="flex min-h-24 flex-col justify-center p-4">
                      {s.fromRate !== null ? (
                        <p><span className="type-price-md">{formatKs(s.fromRate)}</span> <span className="type-body-sm text-text-secondary">{s.rateUnit}</span></p>
                      ) : <p className="type-body-sm text-text-secondary">{t("compare.unavailable")}</p>}
                    </div>
                    <div className="flex min-h-14 items-center p-4"><PaymentModeBadge mode={s.payment.mode} depositPct={s.payment.depositPct} /></div>
                    <div className="type-body-sm flex min-h-14 items-center gap-2 p-4">{s.refundable ? <Check /> : <Cross />}{t("compare.refundable")}</div>
                    <div className="type-body-sm flex min-h-14 items-center gap-2 p-4">{s.coupons ? <Check /> : <Cross />}{t("compare.coupons")}</div>
                    <ul aria-label={t("compare.facilities")} className="type-body-sm flex flex-col gap-2 p-4">
                      {facilities.map((f) => (
                        <li key={f} className={`flex items-center gap-2 ${s.facilities.includes(f) ? "" : "text-text-muted"}`}>
                          {s.facilities.includes(f) ? <Check /> : <Cross />}
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-1 p-4">
                      <LocalLink href={s.href} className="type-label inline-flex min-h-12 items-center justify-center rounded-full bg-action-primary px-6 font-medium text-text-on-action hover:bg-action-primary-hover">{t("compare.view")}</LocalLink>
                      <button type="button" onClick={() => remove(s.id)} className="type-label min-h-11 rounded-full text-text-link hover:bg-surface-brand-subtle">{t("compare.removeShort")}</button>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

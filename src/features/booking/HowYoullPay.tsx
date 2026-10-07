import { MOCK_PAY_WINDOW_MINUTES, MOCK_RESPONSE_WINDOW_MINUTES } from "@/config/booking";
import { formatKs, type PaymentMode, type PriceBreakdown } from "@/domain";
import { useT } from "@/i18n/I18nProvider";

/** The booking flow in plain steps, so nobody is surprised by when they pay. Windows are MOCK assumptions (see config/booking.ts). */
export function HowYoullPay({ mode, price }: { mode: PaymentMode; price: PriceBreakdown }) {
  const t = useT();
  const online = mode === "online";
  const steps = online
    ? [
        { title: t("how.now.title"), body: t("how.now.body") },
        { title: t("how.answer.title", { n: MOCK_RESPONSE_WINDOW_MINUTES }), body: t("how.answer.body") },
        { title: t("how.deposit.title", { n: MOCK_PAY_WINDOW_MINUTES }), body: t("how.deposit.body", { amount: formatKs(price.payNow) }), chip: "KBZPay" },
        { title: t("how.confirmed.title"), body: t("how.confirmed.body", { amount: formatKs(price.payAtProperty) }) },
      ]
    : [
        { title: t("how.now.title"), body: t("how.now.body") },
        { title: t("how.answer.title", { n: MOCK_RESPONSE_WINDOW_MINUTES }), body: t("how.answer.body") },
        { title: t("how.hotel.title"), body: t("how.hotel.body", { amount: formatKs(price.payAtProperty) }) },
      ];
  return (
    <section aria-labelledby="how" className="flex flex-col gap-4">
      <h2 id="how" className="type-heading">{t("how.title")}</h2>
      {/* A plain numbered list: the amounts are already in the price summary, so no chart or split here. */}
      <ol className="divide-y divide-border-subtle rounded-card border border-border-subtle bg-surface-raised px-5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4 py-4">
            <span aria-hidden className="w-4 shrink-0 pt-0.5 text-sm font-medium leading-5 text-text-secondary">{i + 1}</span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium leading-5">
                {s.title}
                {s.chip ? <span className="inline-flex items-center rounded-full border border-border-subtle bg-surface-subtle px-2.5 py-0.5 text-xs font-medium">{s.chip}</span> : null}
              </p>
              <p className="mt-1 text-sm leading-5 text-text-secondary">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

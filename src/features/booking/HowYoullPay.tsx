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
  const last = steps.length - 1;
  return (
    <section aria-labelledby="how" className="flex flex-col gap-4">
      <h2 id="how" className="type-heading">{t("how.title")}</h2>
      <div className="overflow-hidden rounded-card border border-border-subtle bg-surface-raised">
        <div className="grid grid-cols-2 divide-x divide-border-subtle">
          <div className={`p-4 ${online ? "bg-surface-brand-subtle" : ""}`}>
            <p className="type-label text-text-secondary">{t(online ? "how.depositLabel" : "price.payNow")}</p>
            <p className="type-price-md mt-1 text-text-brand">{formatKs(price.payNow)}</p>
          </div>
          <div className={`p-4 ${online ? "" : "bg-surface-brand-subtle"}`}>
            <p className="type-label text-text-secondary">{t("price.payAtProperty")}</p>
            <p className="type-price-md mt-1">{formatKs(price.payAtProperty)}</p>
          </div>
        </div>
      </div>
      <ol className="flex flex-col">
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
            {i < last ? <span aria-hidden className="absolute left-5 top-11 bottom-1 w-px bg-border-subtle" /> : null}
            <span aria-hidden className={`type-label z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${i === last ? "border-action-primary bg-action-primary text-[#fff]" : "border-[#bae6fd] bg-surface-brand-subtle text-text-brand"}`}>{i + 1}</span>
            <div className="min-w-0 pt-1.5">
              <p className="type-subheading">{s.title}</p>
              <p className="type-body-sm mt-1 text-text-secondary">{s.body}</p>
              {s.chip ? <span className="type-label mt-3 inline-flex min-h-10 items-center rounded-full border border-border-subtle bg-surface-subtle px-4">{s.chip}</span> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

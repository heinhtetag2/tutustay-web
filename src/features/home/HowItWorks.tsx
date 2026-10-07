import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";

/** The real booking lifecycle (Terms §04): request → hotel accepts → pay (online stays) → stay. */
export function HowItWorks({ locale, flat = false }: { locale: Locale; flat?: boolean }) {
  const t = createT(locale);
  const steps = [
    { title: t("how.1.title"), body: t("how.1.body") },
    { title: t("how.2.title"), body: t("how.2.body") },
    { title: t("how.3.title"), body: t("how.3.body") },
    { title: t("how.4.title"), body: t("how.4.body") },
  ];
  if (flat) {
    // Home page: numbered steps on a tinted panel, joined by a line, instead of four outlined cards.
    return (
      <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            {i < steps.length - 1 ? <span aria-hidden className="absolute left-12 right-0 top-5 hidden h-px bg-border-subtle lg:block" /> : null}
            <span aria-hidden className="type-label relative mb-4 inline-flex size-10 items-center justify-center rounded-full bg-text-brand text-surface-raised">{i + 1}</span>
            <h3 className="type-subheading">{s.title}</h3>
            <p className="type-body-sm mt-1 text-text-secondary">{s.body}</p>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="rounded-card border border-border-subtle bg-surface-raised p-5">
          <span aria-hidden className="type-label mb-3 inline-flex size-8 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand">{i + 1}</span>
          <h2 className="type-subheading">{s.title}</h2>
          <p className="type-body-sm mt-1 text-text-secondary">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

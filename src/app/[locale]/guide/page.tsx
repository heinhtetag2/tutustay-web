import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LinkButton } from "@/shared/ui/Button";

export const metadata = { title: "How to use TuTuStay" };

export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const steps = ["search", "map", "book", "trip"] as const;
  return (
    <Container size="narrow" className="py-8">
      <PageHeader title={t("guide.title")} description={t("guide.intro")} />
      <ol className="flex flex-col gap-4">
        {steps.map((s, i) => (
          <li key={s} className="rounded-card border border-border-subtle bg-surface-raised p-5">
            <div className="flex items-start gap-3">
              <span aria-hidden className="type-label inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand">{i + 1}</span>
              <div><h2 className="type-subheading">{t(`guide.${s}.title`)}</h2><p className="type-body mt-1 text-text-secondary">{t(`guide.${s}.body`)}</p></div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap gap-3"><LinkButton href="/search">{t("about.cta")}</LinkButton><LinkButton href="/partners" variant="secondary">{t("guide.managers")}</LinkButton></div>
    </Container>
  );
}

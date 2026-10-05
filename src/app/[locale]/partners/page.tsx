import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container, Section } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LinkButton } from "@/shared/ui/Button";

export const metadata = { title: "List your property" };

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const props = ["rates", "arrival", "manage"] as const;
  const steps = ["1", "2", "3"] as const;
  return (
    <Container className="py-8">
      <PageHeader title={t("partners.title")} description={t("partners.intro")} actions={<LinkButton href="/partners/apply" size="lg">{t("partners.apply")}</LinkButton>} />
      <Section className="pt-0">
        <ul className="grid gap-4 md:grid-cols-3">
          {props.map((p) => (
            <li key={p} className="rounded-card border border-border-subtle bg-surface-raised p-5">
              <h2 className="type-subheading">{t(`partners.prop.${p}.title`)}</h2>
              <p className="type-body-sm mt-1 text-text-secondary">{t(`partners.prop.${p}.body`)}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section className="pt-0">
        <h2 className="type-heading mb-4">{t("partners.how")}</h2>
        <ol className="flex flex-col gap-3">
          {steps.map((s) => (
            <li key={s} className="flex gap-3 type-body"><span aria-hidden className="type-label inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand">{s}</span>{t(`partners.step.${s}`)}</li>
          ))}
        </ol>
      </Section>
    </Container>
  );
}

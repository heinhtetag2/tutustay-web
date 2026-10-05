import { notFound } from "next/navigation";
import { HowItWorks } from "@/features/home/HowItWorks";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container, Section } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LinkButton } from "@/shared/ui/Button";

export const metadata = { title: "About" };

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container className="py-8">
      <PageHeader title={t("about.title")} description={t("about.intro")} />
      <Section className="pt-0"><h2 className="type-heading mb-4">{t("about.how")}</h2><HowItWorks locale={locale} /></Section>
      <Section className="pt-0"><LinkButton href="/search" size="lg">{t("about.cta")}</LinkButton></Section>
    </Container>
  );
}

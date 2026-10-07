import { notFound } from "next/navigation";
import { PartnerApplicationForm } from "@/features/partners/PartnerApplicationForm";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "Become a partner" };

export default async function ApplyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container size="narrow" className="py-8">
      <PageHeader crumbs={[{ href: "/partners", label: t("partners.title") }]} title={t("partner.title")} description={t("partner.desc")} />
      <PartnerApplicationForm />
    </Container>
  );
}

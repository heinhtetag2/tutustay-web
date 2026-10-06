import { notFound } from "next/navigation";
import { FaqList } from "@/features/help/FaqList";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "FAQ" };

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container size="narrow" className="py-8">
      <PageHeader back="/help" title={t("help.faq")} description={t("help.faqBody")} />
      <FaqList />
    </Container>
  );
}

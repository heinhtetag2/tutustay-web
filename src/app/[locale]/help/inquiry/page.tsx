import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { EnquiryForm } from "@/features/support/EnquiryForm";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "1:1 enquiry" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container size="narrow" className="py-8">
      <PageHeader back="/help" title={t("enquiry.write")} />
      <AuthGate reason="account"><EnquiryForm /></AuthGate>
    </Container>
  );
}

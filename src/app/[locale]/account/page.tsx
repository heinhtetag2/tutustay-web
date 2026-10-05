import { notFound } from "next/navigation";
import { AccountOverview } from "@/features/auth/AccountOverview";
import { AuthGate } from "@/features/auth/AuthGate";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "Account" };

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container size="narrow" className="py-8">
      <PageHeader title={t("account.title")} />
      <AuthGate reason="account"><AccountOverview /></AuthGate>
    </Container>
  );
}

import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { MyReviewsList } from "@/features/auth/SavedLists";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "My reviews" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container size="narrow" className="py-8">
      <PageHeader title={t("account.reviews")} />
      <AuthGate reason="account"><MyReviewsList /></AuthGate>
    </Container>
  );
}

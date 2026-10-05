import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { PromoCodesList } from "@/features/auth/SavedLists";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "My coupons" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container size="content" className="py-8">
      <PageHeader title={t("nav.myCoupons")} />
      <AuthGate reason="account"><PromoCodesList /></AuthGate>
    </Container>
  );
}

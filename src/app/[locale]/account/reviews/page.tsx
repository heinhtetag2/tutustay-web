import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { MyReviewsList } from "@/features/auth/SavedLists";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "My reviews" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <div>
      <PageHeader title={t("account.reviews")} back={false} />
      <AuthGate reason="account"><MyReviewsList /></AuthGate>
    </div>
  );
}

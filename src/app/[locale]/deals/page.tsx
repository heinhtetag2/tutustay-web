import { notFound } from "next/navigation";
import { DealsView } from "@/features/deals/DealsView";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { listCoupons } from "@/services/coupons.service";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "Deals" };

export default async function DealsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container size="content" className="py-8">
      <PageHeader title={t("nav.deals")} description={t("deals.intro")} />
      <DealsView coupons={listCoupons()} />
    </Container>
  );
}

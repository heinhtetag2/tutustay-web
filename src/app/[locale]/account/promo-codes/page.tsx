import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { DealsView, type DealsTab } from "@/features/deals/DealsView";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { listCoupons } from "@/services/coupons.service";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "Deals & coupons" };

const TABS: DealsTab[] = ["all", "mine", "claimed", "expired"];

/** Deals and your coupons in one place: the same tabs as the public Deals page, opened on "My coupons". */
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { tab } = await searchParams;
  const t = createT(locale);
  return (
    <div>
      <PageHeader title={t("account.nav.coupons")} description={t("deals.intro")} back={false} />
      <AuthGate reason="account"><DealsView coupons={listCoupons()} initialTab={TABS.includes(tab as DealsTab) ? (tab as DealsTab) : "mine"} /></AuthGate>
    </div>
  );
}

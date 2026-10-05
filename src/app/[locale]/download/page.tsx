import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LinkButton } from "@/shared/ui/Button";

export const metadata = { title: "Get the app" };

export default async function DownloadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <Container size="narrow" className="py-8">
      <PageHeader title={t("download.title")} description={t("download.intro")} />
      {/* External link observed on dev.tutustay.com. No unverified claims or statistics on this page. */}
      <a href="https://play.google.com/store/apps/details?id=com.tutustay.app" rel="noopener" className="type-label inline-flex min-h-12 items-center rounded-control bg-action-primary px-6 text-text-on-action hover:bg-action-primary-hover">
        {t("download.play")}
      </a>
      <p className="type-body-sm mt-4 text-text-secondary">{t("download.note")}</p>
      <div className="mt-6"><LinkButton href="/search" variant="secondary">{t("download.browse")}</LinkButton></div>
    </Container>
  );
}

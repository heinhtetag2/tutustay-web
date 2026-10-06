import { notFound } from "next/navigation";
import { LEGAL, findLegal } from "@/features/legal/content";
import { LOCALES, isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { BackLink } from "@/shared/components/BackLink";
import { Container } from "@/shared/layout/Container";
import { LocalLink } from "@/shared/components/LocalLink";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { SUPPORT_EMAIL } from "@/services/support.service";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => LEGAL.map((d) => ({ locale, doc: d.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  return { title: findLegal((await params).doc)?.title ?? "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; doc: string }> }) {
  const { locale, doc } = await params;
  if (!isLocale(locale)) notFound();
  const d = findLegal(doc);
  if (!d) notFound();
  const t = createT(locale);
  return (
    <Container size="narrow" className="py-8">
      <BackLink fallback="/" />
      <p className="type-label text-text-secondary">{t("legal.label")}</p>
      <h1 className="type-title mt-1">{d.title}</h1>
      <p className="type-body mt-2 text-text-secondary">{d.intro}</p>
      <p className="type-body-sm mt-2 text-text-secondary">{t("legal.version", { v: d.version, date: d.published })}</p>

      <section aria-labelledby="summary" className="mt-6 rounded-card bg-surface-brand-subtle p-5">
        <h2 id="summary" className="type-subheading mb-3">{t("legal.summary")}</h2>
        <ul className="type-body flex list-disc flex-col gap-2 pl-5">{d.summary.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>

      <StatusBanner tone="warning" title={t("legal.placeholderTitle")} className="mt-6">{t("legal.placeholderBody")}</StatusBanner>

      <nav aria-label={t("legal.other")} className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        {LEGAL.filter((x) => x.slug !== d.slug).map((x) => <LocalLink key={x.slug} href={`/legal/${x.slug}`} className="type-body-sm text-text-link">{x.title}</LocalLink>)}
      </nav>
      <p className="type-body-sm mt-6 text-text-secondary">{t("legal.contact", { email: SUPPORT_EMAIL })}</p>
    </Container>
  );
}

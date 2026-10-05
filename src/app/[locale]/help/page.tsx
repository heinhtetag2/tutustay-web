import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LocalLink } from "@/shared/components/LocalLink";
import { FAQ } from "@/features/help/faq";

const POPULAR = ["pay-when", "cancel", "fee", "deposit", "receipt"];

export const metadata = { title: "Help & support" };

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const card = "rounded-card border border-border-subtle bg-surface-raised p-5 shadow-card";
  return (
    <Container className="py-8">
      <PageHeader title={t("nav.help")} description={t("help.intro")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <LocalLink href="/help/faq" className={`${card} hover:shadow-raised`}><h2 className="type-subheading">{t("help.faq")}</h2><p className="type-body-sm mt-1 text-text-secondary">{t("help.faqBody")}</p></LocalLink>
        <LocalLink href="/help/contact" className={`${card} hover:shadow-raised`}><h2 className="type-subheading">{t("help.contact")}</h2><p className="type-body-sm mt-1 text-text-secondary">{t("help.contactBody")}</p></LocalLink>
        <LocalLink href="/help/inquiry" className={`${card} hover:shadow-raised`}><h2 className="type-subheading">{t("enquiry.write")}</h2><p className="type-body-sm mt-1 text-text-secondary">{t("enquiry.intro")}</p></LocalLink>
        <LocalLink href="/guide" className={`${card} hover:shadow-raised`}><h2 className="type-subheading">{t("guide.title")}</h2><p className="type-body-sm mt-1 text-text-secondary">{t("guide.intro")}</p></LocalLink>
      </div>
      <section aria-labelledby="popular" className="mt-8">
        <h2 id="popular" className="type-heading mb-3">{t("help.popular")}</h2>
        <ul className="flex flex-col">
          {POPULAR.map((id) => { const f = FAQ.find((x) => x.id === id); return f ? <li key={id}><LocalLink href={`/help/faq#${id}`} className="type-body inline-flex min-h-11 items-center text-text-link">{f.q}</LocalLink></li> : null; })}
        </ul>
      </section>
    </Container>
  );
}

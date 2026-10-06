import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { SUPPORT_EMAIL } from "@/services/support.service";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LinkButton } from "@/shared/ui/Button";

export const metadata = { title: "Contact us" };

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const card = "rounded-card border border-border-subtle bg-surface-raised p-5";
  return (
    <Container size="narrow" className="py-8">
      <PageHeader back="/help" title={t("help.contact")} description={t("contact.intro")} />
      <div className="flex flex-col gap-4">
        <section className={card}><h2 className="type-subheading">{t("contact.cancelTitle")}</h2><p className="type-body mt-1 text-text-secondary">{t("contact.cancelBody")}</p></section>
        <section className={card}>
          <h2 className="type-subheading">{t("contact.enquiryTitle")}</h2><p className="type-body mt-1 text-text-secondary">{t("contact.enquiryBody")}</p>
          <div className="mt-3 flex flex-wrap gap-3"><LinkButton href="/help/inquiry">{t("enquiry.write")}</LinkButton><LinkButton href="/account/support/inquiries" variant="secondary">{t("enquiry.mine")}</LinkButton></div>
        </section>
        <section className={card}><h2 className="type-subheading">{t("contact.emailTitle")}</h2><a className="type-body mt-1 inline-block text-text-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></section>
      </div>
    </Container>
  );
}

import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LocalLink } from "@/shared/components/LocalLink";
import { FAQ } from "@/features/help/faq";

const ICONS = {
  faq: <><circle cx="12" cy="12" r="9" /><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 1-1 1.700M12 17h.01" /></>,
  contact: <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="3" y="13" width="4" height="6" rx="1.500" /><rect x="17" y="13" width="4" height="6" rx="1.500" /><path d="M19 19c0 1.500-1.500 2-4 2" /></>,
  enquiry: <><path d="M4 5h16v11H9l-5 4Z" /><path d="M8 9.500h8M8 12.500h5" /></>,
  guide: <><path d="M4 5.500A2.500 2.500 0 0 1 6.500 3H20v15H6.500A2.500 2.500 0 0 0 4 20.500Z" /><path d="M4 20.500A2.500 2.500 0 0 0 6.500 23H20M9 8h6" /></>,
  chevron: <path d="m9 6 6 6-6 6" />,
};
const Icon = ({ name, className = "size-5" }: { name: keyof typeof ICONS; className?: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[name]}</svg>
);

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
        <LocalLink href="/help/faq" className={`${card} group flex gap-4 hover:shadow-raised`}>
          <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-text-primary"><Icon name="faq" /></span>
          <span className="flex-1"><h2 className="type-subheading">{t("help.faq")}</h2><p className="type-body-sm mt-1 text-text-secondary">{t("help.faqBody")}</p></span>
          <Icon name="chevron" className="mt-1 size-5 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5" />
        </LocalLink>
        <LocalLink href="/help/contact" className={`${card} group flex gap-4 hover:shadow-raised`}>
          <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-text-primary"><Icon name="contact" /></span>
          <span className="flex-1"><h2 className="type-subheading">{t("help.contact")}</h2><p className="type-body-sm mt-1 text-text-secondary">{t("help.contactBody")}</p></span>
          <Icon name="chevron" className="mt-1 size-5 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5" />
        </LocalLink>
        <LocalLink href="/help/inquiry" className={`${card} group flex gap-4 hover:shadow-raised`}>
          <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-text-primary"><Icon name="enquiry" /></span>
          <span className="flex-1"><h2 className="type-subheading">{t("enquiry.write")}</h2><p className="type-body-sm mt-1 text-text-secondary">{t("enquiry.intro")}</p></span>
          <Icon name="chevron" className="mt-1 size-5 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5" />
        </LocalLink>
        <LocalLink href="/guide" className={`${card} group flex gap-4 hover:shadow-raised`}>
          <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-text-primary"><Icon name="guide" /></span>
          <span className="flex-1"><h2 className="type-subheading">{t("guide.title")}</h2><p className="type-body-sm mt-1 text-text-secondary">{t("guide.intro")}</p></span>
          <Icon name="chevron" className="mt-1 size-5 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5" />
        </LocalLink>
      </div>
      <section aria-labelledby="popular" className="mt-8">
        <h2 id="popular" className="type-heading mb-3">{t("help.popular")}</h2>
        <ul className="flex flex-col">
          {POPULAR.map((id) => { const f = FAQ.find((x) => x.id === id); return f ? <li key={id}><LocalLink href={`/help/faq#${id}`} className="type-body inline-flex min-h-11 items-center gap-3 text-text-link"><Icon name="faq" className="size-4 shrink-0 text-text-secondary" />{f.q}</LocalLink></li> : null; })}
        </ul>
      </section>
    </Container>
  );
}

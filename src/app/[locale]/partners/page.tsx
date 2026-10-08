import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container, Section } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { TileIcon, type TileIconName } from "@/features/home/TileIcon";
import { LinkButton } from "@/shared/ui/Button";

export const metadata = { title: "List your property" };

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const props = ["rates", "arrival", "manage"] as const;
  const icons: Record<(typeof props)[number], TileIconName> = { rates: "price", arrival: "payment", manage: "calendar" };
  const steps = ["1", "2", "3"] as const;
  return (
    <Container className="py-8">
      <PageHeader title={t("partners.title")} description={t("partners.intro")} actions={<LinkButton href="/partners/apply" size="lg">{t("partners.apply")}</LinkButton>} />
      <Section className="pt-0">
        <ul className="grid gap-4 md:grid-cols-3">
          {props.map((p) => (
            <li key={p} className="rounded-card border border-border-subtle bg-surface-raised p-5">
              <TileIcon name={icons[p]} />
              <h2 className="type-subheading">{t(`partners.prop.${p}.title`)}</h2>
              <p className="type-body-sm mt-1 text-text-secondary">{t(`partners.prop.${p}.body`)}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section className="pt-0">
        <div className="rounded-card bg-surface-brand-subtle p-6 md:p-10">
          <h2 className="type-heading mb-6">{t("partners.how")}</h2>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-0">
            {steps.map((s) => (
              <li key={s} className="flex flex-col items-center gap-4 text-center md:px-4">
                <div aria-hidden className="flex w-full items-center gap-3">
                  <span className={`hidden h-px flex-1 md:block ${s === "1" ? "" : "bg-border-control"}`} />
                  <span className="type-label flex size-10 shrink-0 items-center justify-center rounded-full bg-action-cta text-text-on-action">{s}</span>
                  <span className={`hidden h-px flex-1 md:block ${s === "3" ? "" : "bg-border-control"}`} />
                </div>
                <p className="type-body">{t(`partners.step.${s}`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </Container>
  );
}

import { notFound } from "next/navigation";
import { TileIcon, type TileIconName } from "@/features/home/TileIcon";
import { PartnerApplicationForm } from "@/features/partners/PartnerApplicationForm";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "Become a partner" };

export default async function ApplyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const props = ["rates", "arrival", "manage"] as const;
  const icons: Record<(typeof props)[number], TileIconName> = { rates: "price", arrival: "payment", manage: "calendar" };
  return (
    <Container className="py-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,var(--container-narrow))_minmax(0,1fr)] lg:gap-16">
        <div>
          <PageHeader crumbs={[{ href: "/partners", label: t("partners.title") }]} title={t("partner.title")} description={t("partner.desc")} />
          <PartnerApplicationForm />
        </div>
        <aside className="h-fit rounded-card bg-surface-brand-subtle p-6 md:p-8 lg:sticky lg:top-28 lg:max-w-md">
          <h2 className="type-heading mb-5">{t("partners.how")}</h2>
          <ol className="flex flex-col gap-5">
            {([1, 2, 3] as const).map((n) => (
              <li key={n} className="relative flex gap-4">
                {n !== 3 ? <span aria-hidden className="absolute left-[17px] top-10 -bottom-5 w-px bg-border-control" /> : null}
                <span aria-hidden className="type-label flex size-9 shrink-0 items-center justify-center rounded-full bg-action-cta text-text-on-action">{n}</span>
                <p className="type-body-sm pt-1.5">{t(`partners.step.${n}`)}</p>
              </li>
            ))}
          </ol>
          <hr className="my-6 border-border-subtle" />
          <ul className="flex flex-col gap-5">
            {props.map((k) => (
              <li key={k} className="flex items-start gap-4 [&>span]:mb-0">
                <TileIcon name={icons[k]} />
                <div>
                  <p className="type-subheading">{t(`partners.prop.${k}.title`)}</p>
                  <p className="type-body-sm mt-1 text-text-secondary">{t(`partners.prop.${k}.body`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Container>
  );
}

import type { Stay } from "@/domain";
import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Section } from "@/shared/layout/Container";
import { AmenityGrid } from "./AmenityGrid";

/** About and facilities (left column, beside the booking card). Reviews, location, policies and nearby stays follow full width. */
export function StaySections({ stay, locale }: { stay: Stay; locale: Locale }) {
  const t = createT(locale);
  const h2 = "type-heading mb-6";
  return (
    <>
      <Section divided id="about" className="pt-6 pb-6 md:pt-8 md:pb-8"><h2 className={h2}>{t("stay.about")}</h2><div className="type-body flex max-w-prose flex-col gap-4 text-text-primary">
        {(stay.about?.length ? stay.about : [stay.summary.replace(/^Mock listing\.\s*/, "")]).map((para) => <p key={para}>{para}</p>)}
      </div></Section>
      <Section divided id="facilities" className="pt-6 pb-6 md:pt-8 md:pb-8">
        <h2 className={h2}>{t("stay.facilities")}</h2>
        <AmenityGrid items={stay.facilities} />
      </Section>
    </>
  );
}

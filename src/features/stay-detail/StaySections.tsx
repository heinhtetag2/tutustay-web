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
      <Section divided id="about"><h2 className={h2}>{t("stay.about")}</h2><p className="type-body max-w-prose text-text-secondary">{stay.summary.replace(/^Mock listing\.\s*/, "")}</p></Section>
      <Section divided id="facilities">
        <h2 className={h2}>{t("stay.facilities")}</h2>
        <AmenityGrid items={stay.facilities} />
      </Section>
    </>
  );
}

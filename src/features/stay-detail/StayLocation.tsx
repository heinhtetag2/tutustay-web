import type { Stay } from "@/domain";
import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Section } from "@/shared/layout/Container";
import { LocationMap } from "./LocationMap";

/** Full-width "where you'll be" block under the two-column layout, as on Airbnb. */
export function StayLocation({ stay, locale }: { stay: Stay; locale: Locale }) {
  const t = createT(locale);
  return (
    <Section divided id="location">
      <h2 className="type-heading mb-2">{t("stay.location")}</h2>
      <p className="type-subheading">{[stay.place.township, stay.place.city].filter(Boolean).join(", ")}</p>
      <p className="type-body text-text-secondary">{stay.place.region}</p>
      <LocationMap name={stay.name} lat={stay.coords.lat} lng={stay.coords.lng} />
    </Section>
  );
}

import type { Stay } from "@/domain";
import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Section } from "@/shared/layout/Container";
import { LocationMap } from "./LocationMap";

/** Full-width "where you'll be" block under the two-column layout, as on Airbnb. */
export function StayLocation({ stay, locale }: { stay: Stay; locale: Locale }) {
  const t = createT(locale);
  return (
    <Section divided id="location" className="pt-6 pb-6 md:pt-8 md:pb-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="type-heading mb-2">{t("stay.location")}</h2>
          <p className="type-subheading">{[stay.place.township, stay.place.city].filter(Boolean).join(", ")}</p>
          <p className="type-body text-text-secondary">{stay.place.region}</p>
        </div>
        {/* Opens the visitor's own maps app or Google Maps with this stay as the destination. */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${stay.coords.lat},${stay.coords.lng}`}
          target="_blank" rel="noopener noreferrer"
          className="type-label inline-flex min-h-11 items-center gap-2 rounded-full border border-border-control bg-surface-raised px-5 hover:bg-surface-subtle"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.500 3.500 3.800 10.300l6.600 2.400 2.400 6.600z" /></svg>
          {t("stay.directions")}
          <span className="sr-only"> ({t("common.opensNewTab")})</span>
        </a>
      </div>
      <LocationMap name={stay.name} lat={stay.coords.lat} lng={stay.coords.lng} />
    </Section>
  );
}

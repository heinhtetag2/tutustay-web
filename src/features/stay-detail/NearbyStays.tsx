import type { Stay } from "@/domain";
import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { ResultCard } from "@/features/search/ResultCard";
import { searchStays } from "@/services/stays.service";
import { Section } from "@/shared/layout/Container";
import type { SearchParams } from "@/validation/search";

/** "More stays nearby": the closest other stays by straight-line distance, carrying the current dates. */
export async function NearbyStays({ stay, locale, params, query }: { stay: Stay; locale: Locale; params: SearchParams; query: string }) {
  const t = createT(locale);
  const near = `${stay.coords.lat},${stay.coords.lng}`;
  const { items } = await searchStays({ ...params, near, place: "", category: undefined, sort: "recommended" });
  const others = items.filter((i) => i.stay.id !== stay.id).slice(0, 4);
  if (others.length === 0) return null;
  return (
    <Section id="nearby" className="pt-6 pb-6 md:pt-8 md:pb-8">
      <h2 className="type-heading">{t("stay.nearby")}</h2>
      <p className="type-body mb-6 text-text-secondary">{t("stay.nearbyHint", { city: stay.place.city })}</p>
      <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-2 [&>li]:w-[78%] [&>li]:shrink-0 [&>li]:snap-start sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 sm:[&>li]:w-auto lg:grid-cols-4">
        {others.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query={query} stayType={params.stayType} foreigner={params.foreigner} layout="card" />)}
      </ul>
    </Section>
  );
}

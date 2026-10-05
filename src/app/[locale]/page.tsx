import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { formatKs, todayIso, type PropertyCategory } from "@/domain";
import { TrustPoints } from "@/features/home/TrustPoints";
import { ResultCard } from "@/features/search/ResultCard";
import { stayCover } from "@/features/stay-detail/photos";
import { SearchBar } from "@/features/search/SearchBar";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { listPlaces, searchStays } from "@/services/stays.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { Container, Section } from "@/shared/layout/Container";
import { LinkButton } from "@/shared/ui/Button";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { parseSearchParams, toQueryString } from "@/validation/search";

const CATEGORIES: PropertyCategory[] = ["hotel", "motel", "resort", "campsite"];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const today = todayIso();
  const { params: p } = parseSearchParams({}, today);
  const { items } = await searchStays({ ...p, sort: "rating" });
  const featured = items.filter((i) => i.available).slice(0, 4);
  const carry = toQueryString({ checkIn: p.checkIn, checkOut: p.checkOut });
  const places = listPlaces();

  return (
    <>
      <div className="bg-surface-brand-subtle">
        <Container size="wide" className="py-10 md:py-16">
          <h1 className="type-display max-w-3xl">{t("home.title")}</h1>
          <p className="type-body mt-3 max-w-2xl text-text-secondary">{t("home.subtitle")}</p>
          <div className="mt-8">
            <SearchBar
              variant="hero" today={today} placeOptions={places.map((x) => x.name)}
              initial={{ place: "", checkIn: p.checkIn, checkOut: p.checkOut, adults: 2, children: 0, rooms: 1, stayType: "overnight", sessionHours: 3, foreigner: false }}
            />
          </div>
        </Container>
      </div>

      <Container size="wide">
        <Section>
          <h2 className="type-heading mb-6">{t("home.byType")}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
            {CATEGORIES.map((c, i) => {
              const group = items.filter((x) => x.stay.category === c);
              if (group.length === 0) return null;
              const from = Math.min(...group.map((x) => x.fromRate ?? Infinity));
              return (
                <li key={c} className="anim-rise" style={{ "--i": i } as CSSProperties}>
                  <LocalLink href={`/search?category=${c}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                      <PhotoTile src={stayCover(group[0]!.stay.id)} alt="" className="absolute inset-0 size-full transition-transform duration-300 group-hover:scale-[1.04]" />
                    </div>
                    <h3 className="type-subheading mt-3">{t(`category.${c}`)}</h3>
                    <p className="type-body-sm text-text-secondary">
                      {t(group.length === 1 ? "search.countOne" : "search.count", { n: group.length })}
                      {Number.isFinite(from) ? ` · ${t("home.fromNight", { price: formatKs(from) })}` : ""}
                    </p>
                  </LocalLink>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section>
          <h2 className="type-heading mb-4">{t("home.places")}</h2>
          <ul className="flex flex-wrap gap-3">
            {places.map((x) => (
              <li key={x.name}>
                <LocalLink href={`/search?place=${encodeURIComponent(x.name)}`} className="type-label inline-flex min-h-11 items-center rounded-field border border-border-subtle bg-surface-raised px-4 hover:bg-surface-subtle">
                  {x.name} <span className="ml-2 font-normal text-text-secondary">{x.fromRate !== null ? `${t("home.fromNight", { price: formatKs(x.fromRate) })} · ` : ""}{t(x.count === 1 ? "search.countOne" : "search.count", { n: x.count })}</span>
                </LocalLink>
              </li>
            ))}
            <li><LocalLink href="/destinations" className="type-label inline-flex min-h-11 items-center px-2 text-text-link">{t("home.allPlaces")}</LocalLink></li>
          </ul>
        </Section>

        <Section>
          <h2 className="type-heading mb-4">{t("home.featured")}</h2>
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query={carry} stayType="overnight" foreigner={false} layout="card" />)}
          </ul>
        </Section>

        <Section><h2 className="type-heading mb-4">{t("home.trust")}</h2><TrustPoints locale={locale} /></Section>

        <Section>
          <h2 className="type-heading mb-4">{t("home.explore")}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {([["/deals", "home.tile.claim"], ["/account/promo-codes", "home.tile.mine"], ["/download", "home.tile.app"], ["/search?sort=price-asc", "home.tile.lowest"], ["/search", "home.tile.browse"]] as const).map(([href, key]) => (
              <li key={key}><LocalLink href={href} className="flex h-full flex-col gap-1 rounded-card border border-border-subtle bg-surface-raised p-4 shadow-card hover:shadow-raised"><span className="type-subheading">{t(`${key}.title`)}</span><span className="type-body-sm text-text-secondary">{t(`${key}.body`)}</span></LocalLink></li>
            ))}
          </ul>
        </Section>

        <Section>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-promo-bg p-6">
            <div><h2 className="type-subheading text-promo-text">{t("home.dealsTitle")}</h2><p className="type-body-sm mt-1">{t("home.dealsBody")}</p></div>
            <LinkButton href="/deals" variant="secondary">{t("nav.deals")}</LinkButton>
          </div>
        </Section>
      </Container>
    </>
  );
}

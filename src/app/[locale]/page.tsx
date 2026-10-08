import { type CSSProperties, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { distanceKm, formatKs, todayIso } from "@/domain";
import { AppSection } from "@/features/home/AppAndPartnerSections";
import { HeroCarousel } from "@/features/home/HeroCarousel";
import { HowItWorks } from "@/features/home/HowItWorks";
import { TrustPoints } from "@/features/home/TrustPoints";
import { ResultCard } from "@/features/search/ResultCard";
import { stayCover } from "@/features/stay-detail/photos";
import { SearchBar } from "@/features/search/SearchBar";
import { dataLabel } from "@/i18n/dataLabels";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { listPlaces, searchStays } from "@/services/stays.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { Container, Section } from "@/shared/layout/Container";
import { LinkButton } from "@/shared/ui/Button";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { parseSearchParams, toQueryString } from "@/validation/search";

const DEMO_LOCATION = { lat: 16.8, lng: 96.15 };
/** One photo per property type that looks like the type (hotel lobby, inn entrance, resort pool, tent), rather than the first stay's cover. */

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const today = todayIso();
  const { params: p } = parseSearchParams({}, today);
  const { items } = await searchStays({ ...p, sort: "rating" });
  const featured = items.filter((i) => i.available).slice(0, 4);
  const mostPopular = items
    .filter((i) => i.available && i.stay.popular)
    .sort((a, b) => (b.stay.rating?.count ?? 0) - (a.stay.rating?.count ?? 0))
    .slice(0, 4);
  // DEMO: shown with a fixed Yangon point until the guest taps "Stay near you" (we never read their location unprompted).
  const nearby = items
    .filter((i) => i.available)
    .map((i) => ({ ...i, distanceKm: distanceKm(DEMO_LOCATION, i.stay.coords) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);
  const appCovers = items.filter((i) => i.available).slice(0, 4).map((i) => ({ name: i.stay.name, place: [i.stay.place.township, i.stay.place.city].filter(Boolean).join(", "), price: i.fromRate !== null ? formatKs(i.fromRate) : "", src: stayCover(i.stay.id) }));
  const carry = toQueryString({ checkIn: p.checkIn, checkOut: p.checkOut });
  const places = listPlaces();

  return (
    <>
      <div className="relative z-10">
        <HeroCarousel
          slides={[
            { src: "/hero/bagan-balloons.jpg", title: t("home.title"), subtitle: t("home.subtitle"), position: "center 30%" },
            { src: "/hero/inle-fisherman.jpg", title: t("home.slide2.title"), subtitle: t("home.slide2.body"), position: "center 55%" },
            { src: "/hero/ngapali-beach.jpg", title: t("home.slide3.title"), subtitle: t("home.slide3.body"), position: "center 55%" },
            { src: "/hero/inle-sunrise.jpg", title: t("home.slide4.title"), subtitle: t("home.slide4.body"), position: "center 50%" },
          ]}
        >
          <SearchBar
            variant="hero" today={today} placeOptions={places.map((x) => x.name)}
            initial={{ place: "", checkIn: p.checkIn, checkOut: p.checkOut, adults: 2, children: 0, rooms: 1, stayType: "overnight", sessionHours: 3, foreigner: false }}
          />
        </HeroCarousel>
      </div>

      <Container size="wide">
        <Section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><span aria-hidden className="mb-2 block h-1 w-10 rounded-full bg-text-brand" /><h2 className="type-heading">{t("home.places")}</h2></div>
            <LocalLink href="/destinations" className="type-label inline-flex min-h-11 shrink-0 items-center text-text-link hover:underline">{t("home.allPlaces")} →</LocalLink>
          </div>
          <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto px-[var(--gutter)] pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 xl:grid-cols-5">
            {places.slice(0, 5).map((x) => (
              <li key={x.name} className="w-[58%] shrink-0 snap-start sm:w-[42%] md:w-auto">
                <LocalLink href={`/search?place=${encodeURIComponent(x.name)}`} className="group relative block aspect-[3/4] overflow-hidden rounded-card bg-surface-subtle shadow-[0_2px_12px_#0000001a] transition-shadow hover:shadow-[0_8px_24px_#00000033]">
                  <PhotoTile src={stayCover(x.coverStayId)} alt="" className="absolute inset-0 size-full transition-transform duration-500 group-hover:scale-105" />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#000000cc] via-[#00000033] to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4 text-[#fff]">
                    <span className="type-heading">{dataLabel(locale, x.name)}</span>
                    <span className="type-body-sm">{t(x.count === 1 ? "search.countOne" : "search.count", { n: x.count })}</span>
                    {x.fromRate !== null ? <span className="type-body-sm opacity-90">{t("home.fromNight", { price: formatKs(x.fromRate) })}</span> : null}
                  </span>
                </LocalLink>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <div className="mb-4 flex items-end justify-between gap-4"><div><span aria-hidden className="mb-2 block h-1 w-10 rounded-full bg-text-brand" /><h2 className="type-heading">{t("home.featured")}</h2></div><LocalLink href="/search" className="type-label inline-flex min-h-11 shrink-0 items-center text-text-link hover:underline">{t("nav.allStays")} →</LocalLink></div>
          <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-2 [&>li]:w-[78%] [&>li]:shrink-0 [&>li]:snap-start sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 sm:[&>li]:w-auto lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query={carry} stayType="overnight" foreigner={false} layout="card" />)}
          </ul>
        </Section>

        {mostPopular.length > 0 ? (
          <Section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <span aria-hidden className="mb-2 block h-1 w-10 rounded-full bg-text-brand" />
                <h2 className="type-heading">{t("home.mostPopular")}</h2>
                <p className="type-body-sm mt-1 text-text-secondary">{t("home.mostPopular.body")}</p>
              </div>
              <LocalLink href="/search?popular=true" className="type-label inline-flex min-h-11 shrink-0 items-center text-text-link hover:underline">{t("nav.allStays")} →</LocalLink>
            </div>
            <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-2 [&>li]:w-[78%] [&>li]:shrink-0 [&>li]:snap-start sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 sm:[&>li]:w-auto lg:grid-cols-3 xl:grid-cols-4">
              {mostPopular.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query={carry} stayType="overnight" foreigner={false} layout="card" />)}
            </ul>
          </Section>
        ) : null}

        {nearby.length > 0 ? (
          <Section>
            <div className="rounded-card bg-surface-subtle p-6 md:p-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <span aria-hidden className="mb-2 block h-1 w-10 rounded-full bg-text-brand" />
                <h2 className="type-heading">{t("home.nearby.title")}</h2>
                <p className="type-body-sm mt-1 text-text-secondary">{t("home.nearby.body")}</p>
              </div>
              <LocalLink href="/search" className="type-label inline-flex min-h-11 shrink-0 items-center text-text-link hover:underline">{t("nav.allStays")} →</LocalLink>
            </div>
            <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-2 [&>li]:w-[78%] [&>li]:shrink-0 [&>li]:snap-start sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 sm:[&>li]:w-auto lg:grid-cols-3 xl:grid-cols-4">
              {nearby.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query={carry} stayType="overnight" foreigner={false} layout="card" />)}
            </ul>
            </div>
          </Section>
        ) : null}

        <Section>
          <div className="rounded-card bg-surface-brand-subtle p-6 md:p-10">
            <h2 className="type-heading mb-6">{t("home.how")}</h2>
            <HowItWorks locale={locale} flat />
            <hr className="my-8 border-border-subtle" />
            <h2 className="sr-only">{t("home.trust")}</h2>
            <TrustPoints locale={locale} flat />
          </div>
        </Section>

        <Section>
          <ul className="grid gap-4 md:grid-cols-2">
            {([
              ["/hero/ngapali-beach.jpg", "center 55%", "home.banner.beach", "/search?place=Thandwe"],
              ["/hero/inle-fisherman.jpg", "center 45%", "home.banner.pay", "/search?bookable=true"],
            ] as const).map(([img, pos, key, href]) => (
              <li key={key}>
                <LocalLink href={href} className="group relative flex min-h-56 items-end overflow-hidden rounded-card text-[#fff]">
                  <PhotoTile src={img} alt="" className="absolute inset-0 size-full transition-transform duration-500 group-hover:scale-105" />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#000000b3] via-[#00000066] to-transparent" />
                  <span className="relative flex max-w-sm flex-col items-start gap-2 p-6">
                    <span className="type-caption rounded-full bg-[#ffffff33] px-2.5 py-0.5 backdrop-blur-sm">{t("home.ad")}</span>
                    <span className="type-heading">{t(`${key}.title`)}</span>
                    <span className="type-body-sm opacity-90">{t(`${key}.body`)}</span>
                    <span className="type-label mt-1 inline-flex min-h-10 items-center rounded-full bg-[#fff] px-4 text-text-primary">{t(`${key}.cta`)}</span>
                  </span>
                </LocalLink>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <div className="rounded-card bg-surface-subtle p-6 md:p-10">
          <div className="mb-4 flex items-end justify-between gap-4"><div><span aria-hidden className="mb-2 block h-1 w-10 rounded-full bg-text-brand" /><h2 className="type-heading">{t("home.faq")}</h2></div><LocalLink href="/help" className="type-label inline-flex min-h-11 shrink-0 items-center text-text-link hover:underline">{t("home.faq.moreHelp")} →</LocalLink></div>
          <div className="grid gap-3 lg:grid-cols-2">
            {([1, 2, 3, 4] as const).map((n) => (
              <details key={n} className="group rounded-card border border-border-subtle bg-surface-raised">
                <summary className="type-label flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 [&::-webkit-details-marker]:hidden">
                  {t(`home.faq.${n}.q`)}
                  <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <p className="type-body-sm px-5 pb-4 text-text-secondary">{t(`home.faq.${n}.a`)}</p>
              </details>
            ))}
          </div>
          </div>
        </Section>

      </Container>
      <div className="-mb-12 overflow-hidden bg-[radial-gradient(55%_55%_at_85%_65%,#bae6fd_0%,#e0f2fe_50%,transparent_100%),linear-gradient(#fff_0%,#f5fbff_55%,#eaf6ff_100%)]">
        <AppSection locale={locale} covers={appCovers} />
      </div>
    </>
  );
}

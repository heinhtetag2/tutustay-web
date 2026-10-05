import { notFound } from "next/navigation";
import { formatDate, ratingLabel, todayIso } from "@/domain";
import { CompareBar, type CompareStay } from "@/features/search/CompareBar";
import { stayCover } from "@/features/stay-detail/photos";
import { SearchBar } from "@/features/search/SearchBar";
import { Filters, SortSelect } from "@/features/search/Filters";
import { ResultCard } from "@/features/search/ResultCard";
import { MapCard } from "@/features/search/MapCard";
import { NearMeButton } from "@/features/search/NearMeButton";
import { SearchMapView } from "@/features/search/SearchMapView";
import { LocalLink } from "@/shared/components/LocalLink";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { listPlaces, searchStays } from "@/services/stays.service";
import { Container } from "@/shared/layout/Container";
import { guestSummaryText } from "@/shared/lib/guestSummary";
import { LinkButton } from "@/shared/ui/Button";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { EmptyState } from "@/shared/ui/States";
import { parseSearchParams, toQueryString } from "@/validation/search";

export const metadata = { title: "Search stays" };

export default async function SearchPage({
  params, searchParams,
}: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const today = todayIso();
  const { params: p, datesRepaired } = parseSearchParams(await searchParams, today);
  const { items } = await searchStays(p);

  // The search context that travels into the stay page and booking step.
  const carry = toQueryString({
    checkIn: p.checkIn, checkOut: p.checkOut, adults: p.adults, children: p.children, rooms: p.rooms,
    stayType: p.stayType, sessionHours: p.sessionHours, foreigner: p.foreigner,
  });
  const places = listPlaces().map((x) => x.name);
  const anyFilter = Boolean(p.category || p.minRating || p.refundable || p.facilities.length || p.minPrice !== undefined || p.maxPrice !== undefined || p.popular || p.bookable || p.coupons || p.beds.length || p.roomFacilities.length);
  const unit = p.stayType === "overnight" ? t("price.perNight") : t("price.perStay");
  const compareStays: CompareStay[] = items.map(({ stay, fromRate, available }) => ({
    id: stay.id, name: stay.name, cover: stayCover(stay.id), href: `/stays/${stay.id}${carry ? `?${carry}` : ""}`,
    categoryLabel: t(`category.${stay.category}`), place: [stay.place.township, stay.place.city].filter(Boolean).join(", "),
    rating: stay.rating ? { score: stay.rating.score.toFixed(1), label: t(`rating.${ratingLabel(stay.rating.score)}`), reviews: t("compare.reviews", { n: stay.rating.count }) } : null,
    fromRate: available ? fromRate : null, rateUnit: unit, payment: stay.payment,
    refundable: stay.rooms.some((r) => r.refundable), coupons: stay.couponEligible, facilities: stay.facilities,
  }));
  const grid = p.view === "grid"; // Grid is the default, as on Airbnb
  const viewHref = (v: "list" | "grid" | "map") => `/search?${toQueryString({ ...p, view: v, bounds: undefined })}`;

  const mapMode = p.view === "map";
  const mapQuery = toQueryString({ ...p, view: "map", bounds: undefined });
  const searchPreserve = { near: p.near, view: p.view, popular: p.popular, bookable: p.bookable, coupons: p.coupons, beds: p.beds, roomFacilities: p.roomFacilities, category: p.category, minPrice: p.minPrice, maxPrice: p.maxPrice, minRating: p.minRating, refundable: p.refundable, facilities: p.facilities, sort: p.sort };
  const searchBar = (
    <SearchBar
      variant="summary" today={today} placeOptions={places}
      initial={{ place: p.place, checkIn: p.checkIn, checkOut: p.checkOut, adults: p.adults, children: p.children, rooms: p.rooms, stayType: p.stayType, sessionHours: p.sessionHours, foreigner: p.foreigner }}
      preserve={searchPreserve}
    />
  );

  // Map mode (the Booking.com pattern): a full-screen takeover with the list beside the map and a way back.
  if (mapMode) {
    const nights = p.stayType === "overnight" ? ` – ${formatDate(p.checkOut, true)}` : "";
    return (
      <>
      <SearchMapView
        items={items} query={carry} stayType={p.stayType} foreigner={p.foreigner} boundsOn={Boolean(p.bounds)}
        closeQuery={toQueryString({ ...p, view: "grid", bounds: undefined })}
        summary={`${p.place || t("search.anywhere")} · ${formatDate(p.checkIn, true)}${nights} · ${guestSummaryText(t, p.adults + p.children, p.rooms)}`}
        sidebar={<Filters params={p} sidebar />}
        sheet={<Filters params={p} sheetOnly />}
        controls={<><SortSelect params={p} />{p.near ? null : <NearMeButton active={false} />}</>}
      />
      <CompareBar stays={compareStays} />
      </>
    );
  }

  return (
    <Container size="wide" className="py-6">
      <SearchBar
        variant="summary" today={today} placeOptions={places}
        initial={{ place: p.place, checkIn: p.checkIn, checkOut: p.checkOut, adults: p.adults, children: p.children, rooms: p.rooms, stayType: p.stayType, sessionHours: p.sessionHours, foreigner: p.foreigner }}
        preserve={searchPreserve}
      />
      {datesRepaired ? <StatusBanner tone="warning" className="mt-4">{t("search.datesRepaired")}</StatusBanner> : null}

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="isolate"><MapCard items={items} mapQuery={mapQuery} /></div>
          <Filters params={p} />
        </div>

        <section aria-label={t("search.results")}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="type-heading">{p.place ? t("search.titlePlace", { place: p.place }) : t("search.title")} <span className="type-body-sm font-normal text-text-secondary">· {t(items.length === 1 ? "search.countOne" : "search.count", { n: items.length })}</span></h1>
            <div className="flex flex-wrap items-center gap-3">
              <SortSelect params={p} />
              <nav aria-label={t("view.label")} className="inline-flex rounded-full border border-border-subtle bg-surface-raised p-1">
                {([["list", "view.list", <path key="l" d="M5 6h14M5 12h14M5 18h14" />], ["grid", "view.grid", <g key="g"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></g>]] as const).map(([v, key, icon]) => {
                  const on = (v === "grid") === grid;
                  return (
                    <LocalLink key={v} href={viewHref(v)} aria-label={t(key)} title={t(key)} aria-current={on ? "true" : undefined}
                      className={`press inline-flex size-10 items-center justify-center rounded-full transition-colors ${on ? "bg-action-primary text-text-on-action" : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"}`}>
                      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                    </LocalLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState
              title={t("search.empty.title")}
              body={t(anyFilter ? "search.empty.filters" : "search.empty.place")}
              action={<LinkButton href={`/search?${toQueryString({ checkIn: p.checkIn, checkOut: p.checkOut, stayType: p.stayType })}`} variant="secondary">{t("search.empty.reset")}</LinkButton>}
            />
          ) : (
            <ul className={grid ? "grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "flex flex-col gap-6"}>
              {items.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query={carry} stayType={p.stayType} foreigner={p.foreigner} layout={grid ? "card" : "row"} />)}
            </ul>
          )}
        </section>
      </div>
      <CompareBar stays={compareStays} />
    </Container>
  );
}

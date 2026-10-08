import { notFound } from "next/navigation";
import { formatDate, todayIso } from "@/domain";
import { SearchBar } from "@/features/search/SearchBar";
import { Filters, QuickChips, SortSelect } from "@/features/search/Filters";
import { ResultCard } from "@/features/search/ResultCard";
import { MapCard } from "@/features/search/MapCard";
import { NearMeButton } from "@/features/search/NearMeButton";
import { ViewSwitch } from "@/features/search/ViewSwitch";
import { ViewToggle } from "@/features/search/ViewToggle";
import { SearchSplit } from "@/features/search/SearchSplit";
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
    const nights = p.stayType === "overnight" ? ` – ${formatDate(p.checkOut, true, locale)}` : "";
    return (
      <>
      <SearchMapView
        items={items} query={carry} stayType={p.stayType} foreigner={p.foreigner} boundsOn={Boolean(p.bounds)}
        closeQuery={toQueryString({ ...p, view: "split", bounds: undefined })}
        summary={`${p.place || t("search.anywhere")} · ${formatDate(p.checkIn, true, locale)}${nights} · ${guestSummaryText(t, p.adults + p.children, p.rooms)}`}
        summaryPlace={p.place || t("search.anywhere")}
        summaryWhen={`${formatDate(p.checkIn, true, locale)}${nights} · ${p.adults + p.children === 1 ? t("guests.guestOne") : t("guests.guestMany", { n: p.adults + p.children })}`}
        searchBar={searchBar}
        filters={<Filters params={p} inline />}
        sheet={<><Filters params={p} sheetOnly /><QuickChips params={p} className="basis-full" /></>}
        controls={<><SortSelect params={p} />{p.near ? null : <NearMeButton active={false} />}</>}
      />
      </>
    );
  }

  const title = `${p.place ? t("search.titlePlace", { place: p.place }) : t("search.title")} · ${t(items.length === 1 ? "search.countOne" : "search.count", { n: items.length })}`;
  const empty = {
    title: t("search.empty.title"), body: t(anyFilter ? "search.empty.filters" : "search.empty.place"),
    action: <LinkButton href={`/search?${toQueryString({ checkIn: p.checkIn, checkOut: p.checkOut, stayType: p.stayType })}`} variant="secondary">{t("search.empty.reset")}</LinkButton>,
  };

  // Grid and list: results across the full width, no map. Same search bar, filters and switch as the split view.
  if (p.view === "grid" || p.view === "list") {
    return (
      <>
        <div className="relative z-30 border-b lg:hidden border-border-subtle bg-surface-brand-subtle px-4 py-2 sm:px-6 md:px-8 lg:py-3">
          {searchBar}
          {datesRepaired ? <StatusBanner tone="warning" className="mt-3">{t("search.datesRepaired")}</StatusBanner> : null}
        </div>
        <section aria-label={t("search.results")} className="mx-auto w-full max-w-[var(--container-wide)] px-4 pb-12 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-5">
            <div className="min-w-0">
              <h1 className="type-subheading">{title}</h1>
              {datesRepaired ? <StatusBanner tone="warning" className="mt-3 hidden lg:block">{t("search.datesRepaired")}</StatusBanner> : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ViewSwitch params={p} locale={locale} />
              <ViewToggle params={p} locale={locale} current="list" className="lg:fixed lg:bottom-6 lg:left-1/2 lg:z-30 lg:-translate-x-1/2" />
              <div className="lg:hidden"><Filters params={p} sheetOnly count={items.length} /></div>
            </div>
          </div>
          <QuickChips params={p} className="mb-5" />
          <div className="mb-6 hidden lg:block"><Filters params={p} inline /></div>
          {items.length === 0 ? (
            <EmptyState title={empty.title} body={empty.body} action={empty.action} />
          ) : (
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, i) => <ResultCard key={item.stay.id} index={i} item={item} locale={locale} query={carry} stayType={p.stayType} foreigner={p.foreigner} layout="card" />)}
            </ul>
          )}
        </section>
      </>
    );
  }

  return (
    <>
      <SearchSplit
        items={items} query={carry} stayType={p.stayType} foreigner={p.foreigner} title={title} mapQuery={mapQuery} searchBar={searchBar} inlineFilters={<Filters params={p} inline />}
        viewToggle={<ViewToggle params={p} locale={locale} current="map" className="lg:absolute lg:bottom-6 lg:left-1/2 lg:z-10 lg:-translate-x-1/2" />}
        notice={datesRepaired ? <StatusBanner tone="warning" className="mt-3">{t("search.datesRepaired")}</StatusBanner> : null}
        controls={<><ViewSwitch params={p} locale={locale} /><Filters params={p} sheetOnly count={items.length} /><QuickChips params={p} className="basis-full" /></>}
        empty={empty}
      />
    </>
  );
}

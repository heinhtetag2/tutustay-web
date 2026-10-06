import { createT } from "@/i18n/translate";
import type { Locale } from "@/i18n/config";
import { LocalLink } from "@/shared/components/LocalLink";
import { toQueryString, type SearchParams } from "@/validation/search";

/** Phones only: wide screens always show the list beside the map. One pill that opens the full-screen map, keeping every other search setting. */
export function ViewSwitch({ params, locale }: { params: SearchParams; locale: Locale }) {
  const t = createT(locale);
  return (
    <LocalLink
      href={`/search?${toQueryString({ ...params, view: "map", bounds: undefined })}`}
      className="type-label inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-border-control bg-surface-raised px-4 shadow-raised transition-colors hover:bg-surface-subtle lg:hidden"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2Z" /><path d="M9 4v14M15 6v14" /></svg>
      {t("view.mapView")}
    </LocalLink>
  );
}

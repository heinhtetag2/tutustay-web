import { createT } from "@/i18n/translate";
import type { Locale } from "@/i18n/config";
import { LocalLink } from "@/shared/components/LocalLink";
import { toQueryString, type SearchParams } from "@/validation/search";

const MAP = <><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2Z" /><path d="M9 4v14M15 6v14" /></>;
const LIST = <path d="M8 6h13M8 12h13M8 18h13M3.500 6h.01M3.500 12h.01M3.500 18h.01" />;

/**
 * Wide screens: a floating pill at the bottom centre that flips between the map and the list ("Show list" on the map,
 * "Show map" on the list). Keeps every other search setting. Position it with `className`.
 */
export function ViewToggle({ params, locale, current, className = "" }: { params: SearchParams; locale: Locale; current: "map" | "list"; className?: string }) {
  const t = createT(locale);
  const toMap = current === "list";
  return (
    <LocalLink
      href={`/search?${toQueryString({ ...params, view: toMap ? "split" : "list", bounds: undefined })}`}
      className={`type-label hidden min-h-12 items-center gap-2 whitespace-nowrap rounded-full bg-text-primary px-5 text-surface-raised shadow-high transition-transform hover:scale-105 lg:inline-flex ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{toMap ? MAP : LIST}</svg>
      {t(toMap ? "view.showMap" : "view.showList")}
    </LocalLink>
  );
}

import { createT } from "@/i18n/translate";
import type { Locale } from "@/i18n/config";
import { LocalLink } from "@/shared/components/LocalLink";
import { toQueryString, type SearchParams } from "@/validation/search";

type View = "split" | "grid" | "list";

const ICONS: Record<View, React.ReactNode> = {
  split: <><rect x="3.500" y="4.500" width="17" height="15" rx="2.500" /><path d="M12 4.500v15M6.500 9h2.500M6.500 12.500h2.500M6.500 16h2.500" /></>,
  grid: <><rect x="4" y="4" width="6.500" height="6.500" rx="1.500" /><rect x="13.500" y="4" width="6.500" height="6.500" rx="1.500" /><rect x="4" y="13.500" width="6.500" height="6.500" rx="1.500" /><rect x="13.500" y="13.500" width="6.500" height="6.500" rx="1.500" /></>,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
};

/** Phones only: wide screens always show the list beside the map. Switches between that list, a photo grid and a plain list, keeping every other search setting. */
export function ViewSwitch({ params, locale }: { params: SearchParams; locale: Locale }) {
  const t = createT(locale);
  const labels: Record<View, string> = { split: t("view.mapPane"), grid: t("view.grid"), list: t("view.list") };
  return (
    <nav aria-label={t("view.label")} className="inline-flex rounded-full border border-border-control bg-surface-raised p-1 shadow-raised lg:hidden">
      {(["split", "grid", "list"] as View[]).map((v) => {
        const on = params.view === v || (v === "grid" && params.view === "map");
        return (
          <LocalLink
            key={v} href={`/search?${toQueryString({ ...params, view: v, bounds: undefined })}`}
            aria-current={on ? "true" : undefined} title={labels[v]}
            className={`type-label inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 transition-colors ${on ? "bg-text-primary text-surface-raised" : "text-text-primary hover:bg-surface-subtle"}`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[v]}</svg>
            <span className="hidden sm:inline">{labels[v]}</span>
          </LocalLink>
        );
      })}
    </nav>
  );
}

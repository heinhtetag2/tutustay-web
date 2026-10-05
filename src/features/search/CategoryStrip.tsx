import type { ReactNode } from "react";
import type { PropertyCategory } from "@/domain";
import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { LocalLink } from "@/shared/components/LocalLink";
import { toQueryString, type SearchParams } from "@/validation/search";

const CATEGORIES: PropertyCategory[] = ["hotel", "motel", "resort", "campsite"];

const svg = (d: ReactNode) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const ICONS: Record<PropertyCategory | "all", ReactNode> = {
  all: svg(<><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>),
  hotel: svg(<><path d="M5.5 21V5a1.5 1.5 0 0 1 1.5-1.5h10A1.5 1.5 0 0 1 18.5 5v16M3 21h18" /><path d="M9.5 8h1.2M13.3 8h1.2M9.5 12h1.2M13.3 12h1.2M10.5 21v-4h3v4" /></>),
  motel: svg(<><path d="m3 11.5 9-7.5 9 7.5" /><path d="M5.5 10v10.5h13V10M10 20.5v-5h4v5" /></>),
  resort: svg(<><path d="M12.5 21c0-4.5.4-8 1.6-11" /><path d="M14 10c-1.8-3-4.8-3.6-8-2.2M14 10c-.2-3.4 2.2-5.4 5.8-5M14 10c2.6-.9 4.8-.2 6.2 1.8M14 10c-3 .4-5 2.3-5.6 5.2" /><path d="M3 21h18" /></>),
  campsite: svg(<><path d="M2.5 20.5 12 4.5l9.5 16z" /><path d="M12 4.5v16M9.3 20.5 12 15l2.7 5.5" /></>),
};

/** Pill chips above the results: "All" plus each property type, each with a round icon badge. Keeps every other filter. */
export function CategoryStrip({ params, locale }: { params: SearchParams; locale: Locale }) {
  const t = createT(locale);
  const href = (c?: PropertyCategory) => `/search?${toQueryString({ ...params, category: c, bounds: undefined })}`;
  const item = (key: PropertyCategory | "all", label: string, link: string) => {
    const on = key === "all" ? !params.category : params.category === key;
    return (
      <li key={key}>
        <LocalLink
          href={link}
          aria-current={on ? "true" : undefined}
          className={`type-label press group flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border py-1 pl-1 pr-4 transition-colors ${
            on ? "border-action-primary bg-surface-brand-subtle text-text-brand" : "border-border-subtle bg-surface-raised hover:border-text-primary"
          }`}
        >
          <span aria-hidden className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${on ? "bg-surface-raised text-text-brand" : "bg-surface-subtle text-text-primary group-hover:bg-surface-brand-subtle group-hover:text-text-brand"}`}>
            {ICONS[key]}
          </span>
          {label}
        </LocalLink>
      </li>
    );
  };
  return (
    <nav aria-label={t("filter.category")} className="mb-6">
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {item("all", t("filter.allCategories"), href())}
        {CATEGORIES.map((c) => item(c, t(`category.${c}`), href(c)))}
      </ul>
    </nav>
  );
}

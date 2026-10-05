"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/I18nProvider";

const CODE: Record<Locale, string> = { en: "EN", my: "MM", ko: "KO" };

/** Dropdown like the live site: current language and code, with the three languages and a check on the active one. */
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const rest = pathname.replace(/^\/[^/]+/, "") || "";
  const href = (l: Locale) => `/${l}${rest}${search ? `?${search}` : ""}`;
  return (
    <details className="relative">
      <summary aria-label={t("nav.language")} className="type-label flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-control px-3 hover:bg-surface-subtle">
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>
        {CODE[locale]}
      </summary>
      <nav aria-label={t("nav.language")} className="absolute right-0 z-20 mt-2 w-44 rounded-card border border-border-subtle bg-surface-raised p-2 shadow-raised">
        {LOCALES.map((l) => (
          <Link key={l} href={href(l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} className="type-body-sm flex min-h-11 items-center justify-between rounded-control px-3 hover:bg-surface-subtle">
            <span>{LOCALE_LABEL[l]}</span><span className="text-text-secondary">{l === locale ? "✓" : CODE[l]}</span>
          </Link>
        ))}
      </nav>
    </details>
  );
}

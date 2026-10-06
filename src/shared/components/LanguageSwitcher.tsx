"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/I18nProvider";

const CODE: Record<Locale, string> = { en: "EN", my: "MM", ko: "KO" };

/** Dropdown like the live site: current language and code, with the three languages and a check on the active one. */
export function LanguageSwitcher({ pillCls = "" }: { pillCls?: string }) {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const rest = pathname.replace(/^\/[^/]+/, "") || "";
  const href = (l: Locale) => `/${l}${rest}${search ? `?${search}` : ""}`;
  return (
    <nav aria-label={t("nav.language")} className={`${pillCls} gap-0.5 p-1`}>
      {LOCALES.filter((l) => l !== "ko").map((l) => (
        <Link
          key={l} href={href(l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} title={LOCALE_LABEL[l]}
          className={`flex h-8 min-w-9 items-center justify-center rounded-full px-2.5 ${l === locale ? "bg-text-primary text-surface-raised" : "hover:bg-[#0000000f]"}`}
        >
          {CODE[l]}
        </Link>
      ))}
    </nav>
  );
}

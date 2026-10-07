"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/I18nProvider";

const CODE: Record<Locale, string> = { en: "EN", my: "MM", ko: "KO" };

/** A globe button with the current language code; it opens a short list of languages with a check on the active one. */
export function LanguageSwitcher({ pillCls = "" }: { pillCls?: string }) {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const root = useRef<HTMLDetailsElement>(null);
  const rest = pathname.replace(/^\/[^/]+/, "") || "";
  const href = (l: Locale) => `/${l}${rest}${search ? `?${search}` : ""}`;

  useEffect(() => {
    const close = () => { if (root.current) root.current.open = false; };
    const away = (e: Event) => { if (root.current?.open && !root.current.contains(e.target as Node)) close(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <details ref={root} className="relative">
      <summary aria-label={`${t("nav.language")}: ${LOCALE_LABEL[locale]}`} className={`${pillCls} list-none gap-1.5 px-3.5 [&::-webkit-details-marker]:hidden`}>
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.500 2.500 3.500 5.500 3.500 9S14.500 18.500 12 21c-2.500-2.500-3.500-5.500-3.500-9S9.500 5.500 12 3Z" /></svg>
        {CODE[locale]}
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
      <ul className="absolute right-0 z-20 mt-2 w-48 rounded-card border border-border-subtle bg-surface-raised p-2 text-text-primary shadow-raised">
        {LOCALES.filter((l) => l !== "ko").map((l) => (
          <li key={l}>
            <Link href={href(l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} className="type-body-sm flex min-h-11 items-center justify-between rounded-control px-3 hover:bg-surface-subtle">
              {LOCALE_LABEL[l]}
              {l === locale ? <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg> : null}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

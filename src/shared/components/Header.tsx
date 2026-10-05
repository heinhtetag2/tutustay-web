"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { sessionLabel, signOut } from "@/services/auth.service";
import { useMockSession } from "../hooks/useMockSession";
import { LinkButton } from "../ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocalLink } from "./LocalLink";

export function Header() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const session = useMockSession();
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const [staysOpen, setStaysOpen] = useState(false);
  const staysRef = useRef<HTMLDivElement>(null);

  // The four property types live under one "Stays" menu; Deals and Help stay as plain links.
  const types = [
    { href: "/search?category=hotel", label: t("category.hotel") },
    { href: "/search?category=motel", label: t("category.motel") },
    { href: "/search?category=resort", label: t("category.resort") },
    { href: "/search?category=campsite", label: t("category.campsite") },
  ];
  const isActive = (seg: string) => pathname.split("/")[2] === seg;
  const linkCls = (on: boolean) => `type-label rounded-control px-3 py-2 hover:bg-surface-subtle ${on ? "bg-surface-subtle" : ""}`;

  useEffect(() => { setStaysOpen(false); setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!staysOpen) return;
    const away = (e: MouseEvent) => { if (!staysRef.current?.contains(e.target as Node)) setStaysOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setStaysOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [staysOpen]);

  return (
    <header className="border-b border-border-subtle bg-surface-raised">
      <div className="site-width mx-auto flex max-w-[var(--container-wide)] items-center justify-between gap-4 px-[var(--gutter)] py-3">
        <LocalLink
          href="/"
          aria-label="TuTuStay home"
          className="flex h-10 w-28 items-center justify-center rounded-xl border border-dashed border-border-control text-sm font-medium tracking-wider text-text-secondary"
        >
          LOGO
        </LocalLink>

        <nav aria-label={t("nav.main")} className="hidden items-center gap-1 lg:flex">
          <div ref={staysRef} className="relative">
            <button type="button" aria-expanded={staysOpen} aria-haspopup="true" onClick={() => setStaysOpen((o) => !o)} className={`${linkCls(isActive("search") || isActive("stays"))} inline-flex cursor-pointer items-center gap-1.5`}>
              {t("nav.stays")}
              <svg aria-hidden viewBox="0 0 16 16" className={`size-3.5 transition-transform ${staysOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
            </button>
            {staysOpen ? (
              <div className="absolute left-0 z-20 mt-2 w-64 rounded-card border border-border-subtle bg-surface-raised p-2 shadow-raised">
                {types.map((n) => (
                  <LocalLink key={n.href} href={n.href} className="type-body-sm flex min-h-11 items-center rounded-control px-3 hover:bg-surface-subtle">{n.label}</LocalLink>
                ))}
                <LocalLink href="/search" className="type-label mt-1 flex min-h-11 items-center justify-between rounded-control border-t border-border-subtle px-3 pt-1 hover:bg-surface-subtle">{t("nav.allStays")} <span aria-hidden>→</span></LocalLink>
              </div>
            ) : null}
          </div>
          <LocalLink href="/deals" aria-current={isActive("deals") ? "page" : undefined} className={linkCls(isActive("deals"))}>{t("nav.deals")}</LocalLink>
          <LocalLink href="/help" aria-current={isActive("help") ? "page" : undefined} className={linkCls(isActive("help"))}>{t("nav.help")}</LocalLink>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block"><Suspense fallback={null}><LanguageSwitcher /></Suspense></div>
          {session ? (
            <details className="group relative">
              <summary aria-label={`${t("account.title")}: ${sessionLabel(session)}`} className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full ring-offset-2 transition-shadow hover:ring-2 hover:ring-border-control group-open:ring-2 group-open:ring-text-primary">
                <span aria-hidden className="type-label flex size-10 items-center justify-center rounded-full bg-text-primary uppercase text-surface-raised">
                  {/^[a-z0-9]/i.test(sessionLabel(session)) ? sessionLabel(session)[0] : (
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                  )}
                </span>
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-card border border-border-subtle bg-surface-raised p-2 shadow-raised">
                <p className="type-body-sm truncate border-b border-border-subtle px-3 pb-2 pt-1 text-text-secondary">{sessionLabel(session)}</p>
                <LocalLink href="/account" className="type-body-sm block rounded-control px-3 py-2 hover:bg-surface-subtle">{t("account.title")}</LocalLink>
                <LocalLink href="/account/bookings" className="type-body-sm block rounded-control px-3 py-2 hover:bg-surface-subtle">{t("nav.myBookings")}</LocalLink>
                <LocalLink href="/deals" className="type-body-sm block rounded-control px-3 py-2 hover:bg-surface-subtle">{t("nav.myCoupons")}</LocalLink>
                <button
                  type="button"
                  onClick={() => { signOut(); router.push(`/${locale}`); }}
                  className="type-body-sm block w-full rounded-control px-3 py-2 text-left hover:bg-surface-subtle"
                >
                  {t("nav.signOut")}
                </button>
              </div>
            </details>
          ) : (
            <LinkButton href="/login" size="md">{t("nav.signIn")}</LinkButton>
          )}
          <button
            type="button" className="type-label min-h-11 rounded-control border border-border-control px-3 lg:hidden"
            aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}
          >
            {t("nav.menu")}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border-subtle px-[var(--gutter)] py-3 lg:hidden">
          <nav aria-label={t("nav.main")} className="flex flex-col">
            <p className="type-label px-3 pb-1 pt-2 text-text-secondary">{t("nav.stays")}</p>
            {types.map((n) => (
              <LocalLink key={n.href} href={n.href} onClick={() => setOpen(false)} className="type-body min-h-11 rounded-control px-3 py-3 hover:bg-surface-subtle">{n.label}</LocalLink>
            ))}
            <div className="my-2 border-t border-border-subtle" />
            <LocalLink href="/deals" onClick={() => setOpen(false)} className="type-body min-h-11 rounded-control px-3 py-3 hover:bg-surface-subtle">{t("nav.deals")}</LocalLink>
            <LocalLink href="/help" onClick={() => setOpen(false)} className="type-body min-h-11 rounded-control px-3 py-3 hover:bg-surface-subtle">{t("nav.help")}</LocalLink>
          </nav>
          <div className="mt-2"><Suspense fallback={null}><LanguageSwitcher /></Suspense></div>
        </div>
      ) : null}
    </header>
  );
}

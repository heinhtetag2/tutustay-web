"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { sessionLabel, signOut } from "@/services/auth.service";
import { useMockSession } from "../hooks/useMockSession";
import { openAuthDialog } from "../hooks/useAuthDialog";
import { LinkButton } from "../ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocalLink } from "./LocalLink";

/** On wide screens a signed-out guest goes straight to the sign-in dialog; on phones the menu opens first (it also holds the page links). */
const wide = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

export function Header() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const session = useMockSession();
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  // On the home page the header floats transparent over the hero banner (white text); it turns solid when the mobile menu is open.
  const overHero = pathname.split("/").filter(Boolean).length <= 1;
  const edge = overHero || pathname.split("/")[2] === "search"; // full-bleed header, close to the screen edges
  // Right-hand controls are pills: frosted over the hero, hairline-bordered elsewhere.
  const pill = `type-label inline-flex min-h-10 cursor-pointer items-center rounded-full text-text-primary transition-colors ${overHero ? "bg-[#ffffffd9] backdrop-blur-md hover:bg-[#fff]" : "border border-border-subtle bg-surface-raised hover:bg-surface-subtle"}`;
  const item = "type-body-sm flex min-h-11 items-center rounded-control px-3 hover:bg-surface-subtle";
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <header className={overHero ? "absolute inset-x-0 top-0 z-40 border-b border-transparent text-[#fff]" : "relative z-40 shrink-0 border-b border-border-subtle bg-surface-raised"}>
      <div className={`site-width mx-auto items-center gap-4 pb-3 flex justify-between ${overHero ? "px-4 pt-6 sm:px-6 md:px-8 md:pt-8" : edge ? "px-4 pt-4 sm:px-6 md:px-8" : "max-w-[var(--container-wide)] px-[var(--gutter)] pt-3"}`}>
        <LocalLink
          href="/"
          aria-label="TuTuStay home"
          className={`flex h-10 w-28 items-center justify-center rounded-xl border border-dashed ${overHero ? "border-[#ffffffb3] text-[#fff]" : "border-border-control text-text-secondary"} text-sm font-medium tracking-wider`}
        >
          LOGO
        </LocalLink>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Suspense fallback={null}><LanguageSwitcher pillCls={pill} /></Suspense>
          <div ref={menuRef} className="relative">
            <button
              type="button" aria-label={session ? `${t("account.title")}: ${sessionLabel(session)}` : t("nav.signIn")} aria-expanded={open} aria-haspopup="true" onClick={() => { if (!session && wide()) openAuthDialog(); else setOpen((o) => !o); }}
              className={`${pill} gap-2.5 py-0 pl-3.5 pr-1`}
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 7h16M8 12h12M4 17h16" /></svg>
              <span aria-hidden className="type-label flex size-8 items-center justify-center rounded-full border border-current text-sm uppercase">
                {session && /^[a-z0-9]/i.test(sessionLabel(session)) ? sessionLabel(session)[0] : (
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                )}
              </span>
            </button>
            {open ? (
              <div className="absolute right-0 z-20 mt-2 w-60 rounded-card border border-border-subtle bg-surface-raised p-2 text-text-primary shadow-raised">
                {session ? (
                  <>
                    <p className="type-body-sm truncate border-b border-border-subtle px-3 pb-2 pt-1 text-text-secondary">{sessionLabel(session)}</p>
                    <LocalLink href="/account" className={item}>{t("account.title")}</LocalLink>
                    <LocalLink href="/account/bookings" className={item}>{t("nav.myBookings")}</LocalLink>
                    <LocalLink href="/account/promo-codes" className={item}>{t("nav.myCoupons")}</LocalLink>
                    <button type="button" onClick={() => { signOut(); router.push(`/${locale}`); }} className={`${item} w-full text-left`}>{t("nav.signOut")}</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setOpen(false); openAuthDialog(); }} className={`${item} w-full cursor-pointer text-left font-semibold`}>{t("nav.signIn")}</button>
                    <LocalLink href="/signup" className={item}>{t("signup.title")}</LocalLink>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

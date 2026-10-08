"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { todayIso } from "@/domain";
import { sessionLabel, signOut } from "@/services/auth.service";
import { bookingsStore } from "@/services/bookings.service";
import { useHydrated } from "../hooks/useHydrated";
import { useStore } from "../hooks/useStore";
import { NotificationBell } from "@/features/auth/NotificationBell";
import { useMockSession } from "../hooks/useMockSession";
import { openAuthDialog } from "../hooks/useAuthDialog";
import { LinkButton } from "../ui/Button";
import { HeaderSearch } from "@/features/search/HeaderSearch";
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
  const hydrated = useHydrated();
  const bookings = useStore(bookingsStore);
  // Active bookings that have not ended yet: shown as a badge on the "My bookings" link.
  const today = todayIso();
  const upcoming = hydrated && session ? bookings.filter((b) => !["cancelled", "rejected", "completed"].includes(b.status) && b.checkOut >= today).length : 0;

  const pathname = usePathname();

  // On the home page the header floats transparent over the hero banner (white text); it turns solid when the mobile menu is open.
  const overHero = pathname.split("/").filter(Boolean).length <= 1;
  const isSearch = pathname.split("/")[2] === "search";
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
      <div className={`site-width relative mx-auto items-center gap-4 pb-3 flex justify-between ${overHero ? "max-w-none! px-4 pt-6 sm:px-6 md:px-8 md:pt-8" : edge ? "max-w-none! px-4 pt-4 sm:px-6 md:px-8" : "max-w-none! px-4 pt-3 sm:px-6 md:px-8"}`}>
        <div className="lg:flex-1">
        <LocalLink href="/" aria-label="TuTuStay home" className="inline-flex h-12 items-center">
          {/* The logo file is white: shown as-is over the hero banner, painted in the brand blue on the white header. */}
          {overHero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo.png" alt="TuTuStay" width={232} height={176} className="h-12 w-auto" />
          ) : (
            <span
              role="img" aria-label="TuTuStay" className="block h-12 w-16 bg-brand"
              style={{ WebkitMaskImage: "url(/logo.png)", maskImage: "url(/logo.png)", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "left center", maskPosition: "left center", WebkitMaskSize: "contain", maskSize: "contain" }}
            />
          )}
        </LocalLink>
        </div>

        {!isSearch ? (
          <nav aria-label={t("nav.main")} className="hidden items-center justify-center gap-1 lg:flex">
            {([["/search", "nav.stays"], ["/account/promo-codes", "nav.deals"], ["/account/bookings", "nav.myBookings"], ["/help", "nav.help"], ["/partners", "partners.apply"]] as const).map(([href, key]) => (
              <LocalLink key={href} href={href} className={`type-label inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold! transition-colors ${overHero ? "hover:bg-[#ffffff33]" : "text-text-primary hover:bg-surface-subtle"}`}>
                {t(key)}
                {href === "/account/bookings" && upcoming ? <span aria-label={`${upcoming}`} className="flex min-w-5 items-center justify-center rounded-full bg-error-text px-1.5 text-xs font-semibold leading-5 text-surface-raised">{upcoming}</span> : null}
              </LocalLink>
            ))}
          </nav>
        ) : null}
        {isSearch ? <div style={{ width: `calc(100% - ${session ? 32 : 48}rem)` }} className="absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center justify-center lg:flex"><Suspense fallback={null}><HeaderSearch /></Suspense></div> : null}
        <div className={`flex items-center justify-end gap-2 sm:gap-3 lg:flex-1`}>
          {session ? <NotificationBell pillCls={pill} /> : null}
          <Suspense fallback={null}><LanguageSwitcher pillCls={pill} /></Suspense>
          {!session ? (
            <div className="hidden items-center gap-2 lg:flex">
              <button type="button" onClick={() => openAuthDialog()} className={`type-label min-h-10 cursor-pointer whitespace-nowrap rounded-full px-4 transition-colors ${overHero ? "hover:bg-[#ffffff33]" : "text-text-primary hover:bg-surface-subtle"}`}>{t("nav.signIn")}</button>
              <LocalLink href="/signup" className="type-label inline-flex min-h-10 items-center whitespace-nowrap rounded-full bg-text-primary px-5 text-surface-raised transition-opacity hover:opacity-85">{t("signup.title")}</LocalLink>
            </div>
          ) : null}
          <div ref={menuRef} className={`relative ${!session ? "lg:hidden" : ""}`}>
            <button
              type="button" aria-label={session ? `${t("account.title")}: ${sessionLabel(session)}` : t("nav.signIn")} aria-expanded={open} aria-haspopup="true" onClick={() => { if (!session && wide()) openAuthDialog(); else setOpen((o) => !o); }}
              className={`${pill} size-10 justify-center p-0`}
            >
              <span aria-hidden className="type-label flex size-full items-center justify-center rounded-full text-sm uppercase">
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

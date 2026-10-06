"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { signOut } from "@/services/auth.service";
import { notificationPrefsStore, readNotificationsStore } from "@/services/profile.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useMockSession } from "@/shared/hooks/useMockSession";
import { useStore } from "@/shared/hooks/useStore";
import { bookingsStore } from "@/services/bookings.service";
import { buildNotifications } from "./notifications";

const ICONS: Record<string, ReactNode> = {
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  bookings: <><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" /></>,
  saved: <path d="M12 20s-7-4.400-7-10a4 4 0 0 1 7-2.600A4 4 0 0 1 19 10c0 5.600-7 10-7 10Z" />,
  deals: <><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" /><path d="M14 6v12" strokeDasharray="2 2.500" /></>,
  reviews: <path d="m12 3.500 2.600 5.300 5.800.800-4.200 4.100 1 5.800L12 16.800 6.800 19.500l1-5.800-4.200-4.100 5.800-.800Z" />,
  notifications: <><path d="M6 17V11a6 6 0 0 1 12 0v6l1.500 2h-15Z" /><path d="M10 21h4" /></>,
  settings: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.700.400-1 .900-1 1.700M12 17h.01" /></>,
  chat: <><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><path d="M8 10h8M8 13h5" /></>,
  logout: <><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 8l4 4-4 4M20 12H9" /></>,
};

function Icon({ name }: { name: string }) {
  return <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[name]}</svg>;
}

/**
 * Account area frame (sidebar on wide screens, a scrolling tab row on phones). Signed out, it renders only the page,
 * which shows the sign-in gate, so the menu never appears for a guest.
 */
export function AccountShell({ children }: { children: ReactNode }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const session = useMockSession();
  const bookings = useStore(bookingsStore);
  const prefs = useStore(notificationPrefsStore);
  const read = useStore(readNotificationsStore);

  if (!hydrated || !session) return <div className="mx-auto w-full max-w-[var(--container-content)] px-[var(--gutter)] py-8">{children}</div>;

  const unread = buildNotifications(t, bookings, prefs).filter((n) => !read.includes(n.id)).length;
  const base = `/${locale}/account`;
  const rest = pathname.replace(/\/$/, "");
  const items: { href: string; key: string; label: string; icon: string; badge?: number }[] = [
    { href: "", key: "profile", label: t("account.nav.profile"), icon: "profile" },
    { href: "/bookings", key: "bookings", label: t("nav.myBookings"), icon: "bookings" },
    { href: "/favorites", key: "favorites", label: t("fav.title"), icon: "saved" },
    { href: "/promo-codes", key: "promo", label: t("account.nav.coupons"), icon: "deals" },
    { href: "/reviews", key: "reviews", label: t("account.reviews"), icon: "reviews" },
    { href: "/notifications", key: "notifications", label: t("account.nav.notifications"), icon: "notifications", badge: unread },
  ];
  const secondary: { href: string; key: string; label: string; icon: string; abs?: boolean; badge?: number }[] = [
    { href: "/support/inquiries", key: "support", label: t("enquiry.mine"), icon: "chat" },
    { href: "/settings", key: "settings", label: t("account.nav.settings"), icon: "settings" },
    { href: `/${locale}/help`, key: "help", label: t("nav.help"), icon: "help", abs: true },
  ];
  const isOn = (href: string) => (href === "" ? rest === base : rest === `${base}${href}` || rest.startsWith(`${base}${href}/`));
  const row = (on: boolean) => `type-label flex min-h-11 items-center gap-3 rounded-field px-3 transition-colors ${on ? "bg-surface-brand-subtle text-text-brand" : "text-text-primary hover:bg-surface-subtle"}`;

  return (
    <div className="mx-auto w-full max-w-[var(--container-content)] px-[var(--gutter)] py-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        <nav aria-label={t("account.nav.label")} className="lg:sticky lg:top-6 lg:self-start">
          <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 lg:hidden">
            {[...items, ...secondary].map((it) => {
              const on = "abs" in it ? false : isOn(it.href);
              return (
                <li key={it.key} className="shrink-0">
                  <LocalLink href={"abs" in it ? it.href.replace(`/${locale}`, "") : `/account${it.href}`} aria-current={on ? "page" : undefined} className={`type-label inline-flex min-h-11 items-center gap-2 rounded-full border px-4 ${on ? "border-transparent bg-surface-brand-subtle text-text-brand" : "border-border-subtle bg-surface-raised"}`}>
                    {it.label}
                    {it.badge ? <span className="rounded-full bg-error-text px-1.5 text-xs text-text-on-action">{it.badge}</span> : null}
                  </LocalLink>
                </li>
              );
            })}
          </ul>

          <div className="hidden rounded-card border border-border-subtle bg-surface-raised p-3 lg:block">
            <ul className="flex flex-col gap-1">
              {items.map((it) => (
                <li key={it.key}>
                  <LocalLink href={`/account${it.href}`} aria-current={isOn(it.href) ? "page" : undefined} className={row(isOn(it.href))}>
                    <Icon name={it.icon} />
                    <span className="flex-1">{it.label}</span>
                    {it.badge ? <span aria-label={`${it.badge}`} className="rounded-full bg-error-text px-2 text-xs font-semibold text-text-on-action">{it.badge}</span> : null}
                  </LocalLink>
                </li>
              ))}
            </ul>
            <ul className="mt-2 flex flex-col gap-1 border-t border-border-subtle pt-2">
              {secondary.map((it) => {
                const on = "abs" in it ? false : isOn(it.href);
                return (
                  <li key={it.key}>
                    <LocalLink href={"abs" in it ? "/help" : `/account${it.href}`} aria-current={on ? "page" : undefined} className={row(on)}><Icon name={it.icon} />{it.label}</LocalLink>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 border-t border-border-subtle pt-2">
              <button type="button" onClick={() => { signOut(); router.push(`/${locale}`); }} className="type-label flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-field px-3 text-error-text hover:bg-error-bg">
                <Icon name="logout" />{t("nav.signOut")}
              </button>
            </div>
          </div>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

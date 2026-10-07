"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { notificationPrefsStore, readNotificationsStore } from "@/services/profile.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useStore } from "@/shared/hooks/useStore";
import { buildNotifications } from "./notifications";

/** Top-bar bell: shows the unread count and opens the latest notifications in a dropdown, without leaving the page. */
export function NotificationBell({ pillCls = "" }: { pillCls?: string }) {
  const t = useT();
  const locale = useLocale();
  const bookings = useStore(bookingsStore);
  const prefs = useStore(notificationPrefsStore);
  const read = useStore(readNotificationsStore);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const all = buildNotifications(t, bookings, prefs);
  const unread = all.filter((n) => !read.includes(n.id)).length;
  const markRead = (id: string) => { if (!read.includes(id)) readNotificationsStore.set([...read, id]); };

  return (
    <div ref={root} className="relative">
      <button
        type="button" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        aria-label={`${t("account.nav.notifications")}${unread ? ` (${unread})` : ""}`}
        className={`${pillCls} relative size-10 justify-center p-0`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.500 2h-15Z" /><path d="M10 21h4" /></svg>
        {unread ? <span aria-hidden className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-error-text px-1 text-xs font-semibold leading-5 text-surface-raised">{unread}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-card border border-border-subtle bg-surface-raised text-text-primary shadow-raised">
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
            <h2 className="type-label font-semibold">{t("account.nav.notifications")}</h2>
            <button type="button" disabled={unread === 0} onClick={() => readNotificationsStore.set(all.map((n) => n.id))} className="type-body-sm cursor-pointer text-text-brand disabled:cursor-default disabled:text-text-muted">{t("notif.markAll")}</button>
          </div>
          {all.length === 0 ? (
            <p className="type-body-sm px-4 py-6 text-center text-text-secondary">{t("notif.empty")}</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto p-2">
              {all.map((n) => {
                const isNew = !read.includes(n.id);
                const inner = (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className={`type-body-sm block ${isNew ? "font-semibold" : ""}`}>{n.title}</span>
                      <span className="type-body-sm block text-text-secondary">{n.body}</span>
                      {n.at ? <span className="type-caption block text-text-muted">{formatDate(n.at.slice(0, 10), true, locale)}</span> : null}
                    </span>
                    {isNew ? <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-action-primary"><span className="sr-only">{t("notif.unread")}</span></span> : null}
                  </>
                );
                const cls = "flex w-full items-start gap-3 rounded-control px-3 py-2.5 text-left hover:bg-surface-subtle";
                return (
                  <li key={n.id}>
                    {n.href
                      ? <LocalLink href={n.href} onClick={() => { markRead(n.id); setOpen(false); }} className={cls}>{inner}</LocalLink>
                      : <button type="button" onClick={() => markRead(n.id)} className={`${cls} cursor-pointer`}>{inner}</button>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

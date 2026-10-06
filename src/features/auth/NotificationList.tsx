"use client";

import { useState } from "react";
import { formatDate } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { notificationPrefsStore, readNotificationsStore } from "@/services/profile.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/States";
import { buildNotifications } from "./notifications";

const ICON = {
  booking: <><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" /></>,
  deal: <><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" /><path d="M14 6v12" strokeDasharray="2 2.500" /></>,
  welcome: <path d="m12 3 1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800Z" />,
};

export function NotificationList() {
  const t = useT();
  const locale = useLocale();
  const bookings = useStore(bookingsStore);
  const prefs = useStore(notificationPrefsStore);
  const read = useStore(readNotificationsStore);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const all = buildNotifications(t, bookings, prefs);
  const shown = filter === "unread" ? all.filter((n) => !read.includes(n.id)) : all;
  const unread = all.filter((n) => !read.includes(n.id)).length;
  const markRead = (id: string) => { if (!read.includes(id)) readNotificationsStore.set([...read, id]); };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-title">{t("account.nav.notifications")}</h1>
          <p className="type-body mt-2 text-text-secondary">{t("notif.subtitle")}</p>
        </div>
        <Button variant="secondary" disabled={unread === 0} onClick={() => readNotificationsStore.set(all.map((n) => n.id))}>{t("notif.markAll")}</Button>
      </header>

      <div role="group" aria-label={t("account.nav.notifications")} className="flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
            className={`type-label min-h-11 rounded-full border px-4 ${filter === f ? "border-text-primary bg-surface-subtle" : "border-border-subtle bg-surface-raised hover:bg-surface-subtle"}`}>
            {t(f === "all" ? "notif.all" : "notif.unread")}{f === "unread" && unread ? ` (${unread})` : ""}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState title={t("notif.empty")} body={t("notif.emptyBody")} />
      ) : (
        <ul className="overflow-hidden rounded-card border border-border-subtle bg-surface-raised">
          {shown.map((n) => {
            const isNew = !read.includes(n.id);
            const inner = (
              <>
                <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICON[n.kind]}</svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`type-label block ${isNew ? "" : "font-normal"}`}>{n.title}</span>
                  <span className="type-body-sm block text-text-secondary">{n.body}</span>
                  {n.at ? <span className="type-body-sm block text-text-muted">{formatDate(n.at.slice(0, 10), false, locale)}</span> : null}
                </span>
                {isNew ? <span className="mt-1 size-2.5 shrink-0 rounded-full bg-action-primary"><span className="sr-only">{t("notif.unread")}</span></span> : null}
              </>
            );
            const cls = "flex items-start gap-4 border-b border-border-subtle p-4 last:border-b-0 hover:bg-surface-subtle";
            return (
              <li key={n.id}>
                {n.href ? <LocalLink href={n.href} onClick={() => markRead(n.id)} className={cls}>{inner}</LocalLink> : <button type="button" onClick={() => markRead(n.id)} className={`${cls} w-full cursor-pointer text-left`}>{inner}</button>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

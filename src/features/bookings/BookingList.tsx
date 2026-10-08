"use client";

import { useEffect, useState } from "react";
import { formatDate, formatKs, todayIso, type Booking } from "@/domain";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore, clearMockBookings, seedDemoBookings } from "@/services/bookings.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useStore } from "@/shared/hooks/useStore";
import { Button, LinkButton } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState } from "@/shared/ui/States";
import { stayCover } from "@/features/stay-detail/photos";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { StatusBadge } from "./StatusBadge";

type Tab = "upcoming" | "past" | "cancelled";
const CANCELLED = ["cancelled", "rejected"];

function tabOf(b: Booking, today: string): Tab {
  if (CANCELLED.includes(b.status)) return "cancelled";
  return b.status === "completed" || b.checkOut < today ? "past" : "upcoming";
}

export function BookingList() {
  const t = useT();
  const locale = useLocale();
  const hydrated = useHydrated();
  const all = useStore(bookingsStore);
  const [tab, setTab] = useState<Tab>("upcoming");
  const today = todayIso();
  useEffect(() => { if (hydrated) seedDemoBookings(); }, [hydrated]);
  if (!hydrated) return <Skeleton className="h-48 w-full" />;
  const tabs: Tab[] = ["upcoming", "past", "cancelled"];
  const shown = all.filter((b) => tabOf(b, today) === tab);

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label={t("nav.myBookings")} className="flex gap-1 border-b border-border-subtle">
        {tabs.map((x) => (
          <button
            key={x} role="tab" type="button" aria-selected={tab === x} onClick={() => setTab(x)}
            className={`type-label min-h-11 px-4 ${tab === x ? "border-b-2 border-border-focus text-text-brand" : "text-text-secondary"}`}
          >
            {t(`bookings.tab.${x}`)} ({all.filter((b) => tabOf(b, today) === x).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState title={t(`bookings.empty.${tab}`)} body={t("bookings.empty.body")} action={<LinkButton href="/search">{t("nav.stays")}</LinkButton>} />
      ) : (
        <div role="tabpanel"><ul className="flex flex-col gap-3">
          {shown.map((b) => (
            <li key={b.ref}>
              <LocalLink href={`/bookings/${b.ref}`} className="group flex items-center gap-4 rounded-card border border-border-subtle bg-surface-raised p-3 transition-colors hover:border-text-primary sm:p-4">
                <PhotoTile src={stayCover(b.stayId)} alt="" className="size-20 shrink-0 rounded-field sm:size-24" />
                <div className="min-w-0 flex-1">
                  <p className="type-subheading truncate">{b.stayName}</p>
                  <p className="type-body-sm truncate text-text-secondary">{b.roomName}</p>
                  <p className="type-body-sm text-text-secondary">{formatDate(b.checkIn, true, locale)}{b.stayType === "overnight" ? ` – ${formatDate(b.checkOut, true, locale)}` : ""} · {b.ref}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5"><StatusBadge status={b.status} /><span className="type-price-sm">{formatKs(b.price.total)}</span></div>
                <span aria-hidden className="hidden text-text-secondary transition-transform group-hover:translate-x-0.5 sm:block">›</span>
              </LocalLink>
            </li>
          ))}
        </ul></div>
      )}
      {all.length > 0 ? <div><Button variant="ghost" onClick={clearMockBookings}>{t("bookings.clearMock")}</Button></div> : null}
    </div>
  );
}

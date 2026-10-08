"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { bookingDeadline, bookingsStore } from "@/services/bookings.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { formatCountdown, useCountdown } from "@/shared/hooks/useCountdown";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useMockSession } from "@/shared/hooks/useMockSession";
import { useStore } from "@/shared/hooks/useStore";

/**
 * A floating reminder on every page while a booking is waiting on something: the property's answer, or your online deposit.
 * Shows the soonest deadline with a live timer and links to that booking. Only for a signed-in guest (bookings belong to an account),
 * and hidden on the booking's own page (it has the timer too).
 */
export function ActiveBookingBar() {
  const t = useT();
  const hydrated = useHydrated();
  const session = useMockSession();
  const pathname = usePathname();
  const bookings = useStore(bookingsStore);
  const [hidden, setHidden] = useState<string | null>(null);

  const now = hydrated ? Date.now() : 0;
  const waiting = bookings
    .map((b) => ({ b, d: bookingDeadline(b) }))
    .filter((x): x is { b: typeof x.b; d: NonNullable<typeof x.d> } => x.d !== null && x.d.at > now)
    .sort((a, c) => a.d.at - c.d.at)[0];
  const left = useCountdown(waiting?.d.at ?? null);

  if (!hydrated || !session || !waiting || left === null || left <= 0 || hidden === waiting.b.ref) return null;
  if (pathname.includes("/bookings/")) return null;
  const pay = waiting.d.kind === "pay";

  return (
    <div role="status" className="fixed bottom-20 left-4 right-[4.5rem] z-30 sm:left-auto sm:bottom-5 sm:right-24 sm:w-[22rem] lg:bottom-5">
      <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-raised p-3 pr-2 shadow-high">
        <span aria-hidden className={`flex size-11 shrink-0 items-center justify-center rounded-full ${pay ? "bg-[#fef3c7] text-[#92400e]" : "bg-surface-brand-subtle text-text-brand"}`}>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.500 1.500M9 2.500h6" /></svg>
        </span>
        <LocalLink href={`/bookings/${waiting.b.ref}`} className="min-w-0 flex-1">
          <p className="type-label truncate">{t(pay ? "bar.pay" : "bar.answer", { name: waiting.b.stayName })}</p>
          <p className="type-body-sm text-text-secondary"><span className="type-price-sm tabular-nums text-text-primary">{formatCountdown(left)}</span> {t("bar.left")}</p>
        </LocalLink>
        <button type="button" aria-label={t("common.close")} onClick={() => setHidden(waiting.b.ref)} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-subtle">
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
    </div>
  );
}

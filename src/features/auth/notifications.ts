import type { Booking } from "@/domain";
import type { TFunction } from "@/i18n/translate";
import type { NotificationPrefs } from "@/services/profile.service";

export interface AppNotification { id: string; title: string; body: string; at?: string; href?: string; kind: "booking" | "deal" | "welcome" }

/**
 * MOCK notifications, derived from this browser's bookings plus two fixed messages. There is no push or email behind them.
 * Booking updates and deal messages follow the guest's preferences.
 */
export function buildNotifications(t: TFunction, bookings: Booking[], prefs: NotificationPrefs): AppNotification[] {
  const list: AppNotification[] = [];
  if (prefs.bookings) {
    for (const b of bookings) {
      list.push({
        id: `booking-${b.ref}-${b.status}`, kind: "booking", at: b.createdAt, href: `/bookings/${b.ref}`,
        title: t("notif.booking.title", { stay: b.stayName }),
        body: t("notif.booking.body", { ref: b.ref, status: t(`status.${b.status}`) }),
      });
    }
  }
  if (prefs.deals) list.push({ id: "deal-welcome10", kind: "deal", href: "/account/promo-codes?tab=all", title: t("notif.deal.title"), body: t("notif.deal.body") });
  list.push({ id: "welcome", kind: "welcome", title: t("notif.welcome.title"), body: t("notif.welcome.body") });
  return list;
}

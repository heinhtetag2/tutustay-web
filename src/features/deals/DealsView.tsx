"use client";

import { useState } from "react";
import { formatKs, todayIso, type Coupon } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { claimedCouponsStore } from "@/services/preferences.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useStore } from "@/shared/hooks/useStore";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { EmptyState } from "@/shared/ui/States";

type Tab = "all" | "mine" | "claimed" | "expired";

export function DealsView({ coupons }: { coupons: Coupon[] }) {
  const t = useT();
  const claimed = useStore(claimedCouponsStore);
  const [tab, setTab] = useState<Tab>("all");
  const today = todayIso();
  const expired = (c: Coupon) => c.expires < today;
  // ASSUMPTION: the live tabs are "All deals / My coupons / Claimed / Expired". "My coupons" = claimed and still usable;
  // "Claimed" = everything you've claimed, including expired ones. The live semantics are not documented.
  const shown = coupons.filter((c) => (tab === "all" ? !expired(c) : tab === "mine" ? claimed.includes(c.code) && !expired(c) : tab === "claimed" ? claimed.includes(c.code) : expired(c)));

  return (
    <div className="flex flex-col gap-4">
      <LocalLink href="/help/faq#coupon" className="type-body-sm text-text-link underline">{t("deals.howTo")}</LocalLink>
      <div role="tablist" aria-label={t("nav.deals")} className="flex gap-1 border-b border-border-subtle">
        {(["all", "mine", "claimed", "expired"] as Tab[]).map((x) => (
          <button key={x} role="tab" type="button" aria-selected={tab === x} onClick={() => setTab(x)} className={`type-label min-h-11 px-4 ${tab === x ? "border-b-2 border-border-focus text-text-brand" : "text-text-secondary"}`}>{t(`deals.tab.${x}`)}</button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState title={t("deals.empty.title")} body={t("deals.empty.body")} />
      ) : (
        <div role="tabpanel"><ul className="grid gap-4 sm:grid-cols-2">
          {shown.map((c) => {
            const isClaimed = claimed.includes(c.code);
            return (
              <li key={c.code} className="flex flex-col gap-3 rounded-card border border-border-subtle bg-promo-bg p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="type-subheading text-promo-text">{c.title}</h2>
                  {isClaimed ? <Badge tone="success">{t("deals.claimed")}</Badge> : null}
                </div>
                <p className="type-body-sm text-text-primary">
                  {c.minSpend ? t("deals.minSpend", { amount: formatKs(c.minSpend) }) : t("deals.noMin")}
                  {c.maxDiscount ? ` · ${t("deals.maxDiscount", { amount: formatKs(c.maxDiscount) })}` : ""} · {t("deals.expires", { date: c.expires })}
                </p>
                <p className="type-price-sm">{c.code}</p>
                <Button
                  variant="secondary" className="self-start" disabled={expired(c) || isClaimed}
                  onClick={() => claimedCouponsStore.set([...claimed, c.code])}
                >
                  {expired(c) ? t("deals.expired") : isClaimed ? t("deals.claimed") : t("deals.claim")}
                </Button>
              </li>
            );
          })}
        </ul></div>
      )}
    </div>
  );
}

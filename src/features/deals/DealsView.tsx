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

export type DealsTab = "all" | "mine" | "claimed" | "expired";
type Tab = DealsTab;

export function DealsView({ coupons, initialTab = "all" }: { coupons: Coupon[]; initialTab?: DealsTab }) {
  const t = useT();
  const claimed = useStore(claimedCouponsStore);
  const [tab, setTab] = useState<Tab>(initialTab);
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
        <EmptyState title={t("deals.empty.title")} body={t("deals.empty.body")} action={tab !== "all" ? <Button onClick={() => setTab("all")}>{t("deals.browseAll")}</Button> : undefined} />
      ) : (
        <div role="tabpanel"><ul className="grid gap-4 sm:grid-cols-2">
          {shown.map((c) => {
            const isClaimed = claimed.includes(c.code);
            return (
              <li
                key={c.code}
                style={{ backgroundImage: "url(/coupon/coupon-bg.webp)", backgroundColor: "#a8e3f1" }}
                className={`relative flex flex-col gap-3 overflow-hidden rounded-card border border-border-subtle bg-[length:100%_auto] bg-right-bottom bg-no-repeat pl-5 pr-5 pt-5 pb-[calc(42%+1.25rem)] sm:bg-cover sm:bg-right sm:py-5 sm:pr-[38%] ${expired(c) ? "grayscale" : ""}`}
              >
                {isClaimed ? <Badge tone="success" className="absolute right-3 top-3 shadow-card">{t("deals.claimed")}</Badge> : null}
                <h2 className="type-heading text-text-primary">{c.title}</h2>
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

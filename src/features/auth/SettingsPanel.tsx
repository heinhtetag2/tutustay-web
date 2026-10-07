"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LOCALES, LOCALE_LABEL } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { DELETION_GRACE_DAYS, requestDeletion, signOut } from "@/services/auth.service";
import { notificationPrefsStore } from "@/services/profile.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { StatusBanner } from "@/shared/ui/StatusBanner";

const card = "rounded-card border border-border-subtle bg-surface-raised p-5 md:p-6";

function Toggle({ label, body, on, onChange }: { label: string; body: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div><p className="type-label">{label}</p><p className="type-body-sm text-text-secondary">{body}</p></div>
      <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
        className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${on ? "bg-action-primary" : "bg-border-control"}`}>
        <span aria-hidden className={`absolute left-0.5 top-0.5 size-6 rounded-full bg-surface-raised shadow-raised transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export function SettingsPanel() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const prefs = useStore(notificationPrefsStore);
  const [confirming, setConfirming] = useState(false);
  const rest = pathname.replace(/^\/[^/]+/, "");
  const langs = LOCALES.filter((l) => l !== "ko");

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="type-title">{t("account.nav.settings")}</h1>
        <p className="type-body mt-2 text-text-secondary">{t("settings.subtitle")}</p>
      </header>

      <section aria-labelledby="st-lang" className={card}>
        <h2 id="st-lang" className="type-heading">{t("profile.language")}</h2>
        <p className="type-body-sm mt-1 text-text-secondary">{t("settings.languageBody")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {langs.map((l) => (
            <a key={l} href={`/${l}${rest}${search ? `?${search}` : ""}`} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined}
              className={`type-label inline-flex min-h-11 items-center rounded-full border px-5 ${l === locale ? "border-text-primary bg-surface-subtle" : "border-border-subtle hover:bg-surface-subtle"}`}>
              {LOCALE_LABEL[l]}{l === locale ? " ✓" : ""}
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="st-cur" className={card}>
        <h2 id="st-cur" className="type-heading">{t("profile.currency")}</h2>
        <p className="type-body-sm mt-1 text-text-secondary">{t("settings.currencyBody")}</p>
        <p className="type-label mt-3">MMK (Kyat)</p>
      </section>

      <section aria-labelledby="st-notif" className={card}>
        <h2 id="st-notif" className="type-heading">{t("settings.notifications")}</h2>
        <div className="mt-2 divide-y divide-border-subtle">
          <Toggle label={t("settings.notif.bookings")} body={t("settings.notif.bookingsBody")} on={prefs.bookings} onChange={(v) => notificationPrefsStore.set({ ...prefs, bookings: v })} />
          <Toggle label={t("settings.notif.deals")} body={t("settings.notif.dealsBody")} on={prefs.deals} onChange={(v) => notificationPrefsStore.set({ ...prefs, deals: v })} />
        </div>
      </section>

      <section aria-labelledby="st-help" className={card}>
        <h2 id="st-help" className="type-heading">{t("nav.help")}</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <LocalLink href="/help" className="type-label inline-flex min-h-11 items-center rounded-control border border-text-primary px-4 hover:bg-surface-subtle">{t("nav.help")}</LocalLink>
          <LocalLink href="/account/support/inquiries" className="type-label inline-flex min-h-11 items-center rounded-control border border-border-control px-4 hover:bg-surface-subtle">{t("enquiry.mine")}</LocalLink>
        </div>
      </section>

      <section aria-labelledby="del" className={card}>
        <h2 id="del" className="type-heading">{t("account.delete.title")}</h2>
        {!confirming ? (
          <>
            <p className="type-body-sm mt-1 text-text-secondary">{t("account.delete.body", { days: DELETION_GRACE_DAYS })}</p>
            <Button variant="secondary" className="mt-3 border-error-text text-error-text hover:bg-error-bg" onClick={() => setConfirming(true)}>{t("account.delete.start")}</Button>
          </>
        ) : (
          <div role="alertdialog" aria-labelledby="del-q" className="mt-3 flex flex-col gap-3">
            <p id="del-q" className="type-body">{t("account.delete.confirmQ")}</p>
            <StatusBanner tone="warning">{t("account.delete.consequence", { days: DELETION_GRACE_DAYS })}</StatusBanner>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-error-text text-surface-raised hover:bg-error-text hover:opacity-90 active:bg-error-text" onClick={() => { requestDeletion(); router.push(`/${locale}/login`); }}>{t("account.delete.confirm")}</Button>
              <Button variant="secondary" onClick={() => setConfirming(false)}>{t("account.delete.keep")}</Button>
            </div>
          </div>
        )}
      </section>

      <div><Button variant="secondary" onClick={() => { signOut(); router.push(`/${locale}`); }}>{t("nav.signOut")}</Button></div>
    </div>
  );
}

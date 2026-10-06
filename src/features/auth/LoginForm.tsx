"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "@/i18n/I18nProvider";
import { AuthPanel } from "./AuthPanel";

/** Only follow `next` if it stays on this site. A path from another locale is re-homed to the current one. */
function safeNext(next: string | null, locale: string): string {
  const fallback = `/${locale}/account/bookings`;
  if (!next || next.startsWith("//")) return fallback;
  const match = next.match(/^\/(en|my|ko)(\/.*)$/);
  return match ? `/${locale}${match[2]}` : fallback;
}

/** The /login page: the same sign-in panel as the dialog, in a card. */
export function LoginForm() {
  const locale = useLocale();
  const rawNext = useSearchParams().get("next");
  return (
    <div className="rounded-sheet border border-border-subtle bg-surface-raised p-6 shadow-high md:p-8">
      <AuthPanel next={safeNext(rawNext, locale)} />
    </div>
  );
}

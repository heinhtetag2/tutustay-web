"use client";

import { useLocale, useT } from "@/i18n/I18nProvider";
import { enquiriesStore } from "@/services/support.service";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useStore } from "@/shared/hooks/useStore";
import { Badge } from "@/shared/ui/Badge";
import { LocalLink } from "@/shared/components/LocalLink";
import { LinkButton } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState } from "@/shared/ui/States";

export function EnquiryList() {
  const t = useT();
  const locale = useLocale();
  const hydrated = useHydrated();
  const items = useStore(enquiriesStore);
  if (!hydrated) return <Skeleton className="h-40 w-full" />;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span aria-hidden className="flex size-24 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand">
          <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5l-3 2.500V14H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><path d="M17 9.500h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v2l-2.500-2H12" /><path d="M7.500 9.500h.01M10 9.500h.01M12.500 9.500h.01" /></svg>
        </span>
        <h2 className="type-heading">{t("enquiry.empty.title")}</h2>
        <p className="type-body max-w-sm text-text-secondary">{t("enquiry.empty.body")}</p>
        <LinkButton href="/help/inquiry">{t("enquiry.write")}</LinkButton>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end"><LinkButton href="/help/inquiry">{t("enquiry.write")}</LinkButton></div>
      {/* Always-there "ask a question" button, like the app. */}
      <LocalLink href="/help/inquiry" aria-label={t("enquiry.write")} className="fixed bottom-44 right-4 z-30 inline-flex size-14 items-center justify-center rounded-full bg-action-cta text-text-on-action shadow-raised transition-transform hover:scale-105 lg:hidden">
        <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="m13.500 6.500 4 4" /></svg>
      </LocalLink>
      <ul className="flex flex-col gap-3">
        {items.map((e) => (
          <li key={e.id} className="rounded-card border border-border-subtle bg-surface-raised p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0"><p className="type-subheading">{e.subject || e.message.slice(0, 60)}</p><p className="type-body-sm text-text-secondary">{t(`enquiry.topic.${e.topic}`)} · {e.id} · {new Date(e.createdAt).toLocaleDateString(locale)}</p></div>
              <Badge tone={e.reply ? "success" : "info"}>{t(e.reply ? "enquiry.answered" : "enquiry.awaiting")}</Badge>
            </div>
            {e.bookingRef ? <p className="type-body-sm text-text-secondary">{e.bookingRef}</p> : null}
            <p className="type-body mt-2">{e.message}</p>
            {e.attachments.length ? <p className="type-body-sm mt-1 text-text-secondary">{e.attachments.join(", ")}</p> : null}
            {e.reply ? (
              <div className="mt-3 rounded-control bg-surface-brand-subtle p-3">
                <p className="type-label text-text-brand">{t("enquiry.reply")}</p>
                <p className="type-body-sm mt-1">{e.reply}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

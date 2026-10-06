"use client";

import { useT } from "@/i18n/I18nProvider";
import { enquiriesStore } from "@/services/support.service";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useStore } from "@/shared/hooks/useStore";
import { Badge } from "@/shared/ui/Badge";
import { LinkButton } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState } from "@/shared/ui/States";

export function EnquiryList() {
  const t = useT();
  const hydrated = useHydrated();
  const items = useStore(enquiriesStore);
  if (!hydrated) return <Skeleton className="h-40 w-full" />;
  if (items.length === 0) return <EmptyState title={t("enquiry.empty.title")} body={t("enquiry.empty.body")} action={<LinkButton href="/help/inquiry">{t("enquiry.write")}</LinkButton>} />;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end"><LinkButton href="/help/inquiry">{t("enquiry.write")}</LinkButton></div>
      <ul className="flex flex-col gap-3">
        {items.map((e) => (
          <li key={e.id} className="rounded-card border border-border-subtle bg-surface-raised p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="type-subheading">{t(`enquiry.topic.${e.topic}`)} · {e.id}</p>
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

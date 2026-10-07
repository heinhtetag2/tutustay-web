"use client";

import { useT } from "@/i18n/I18nProvider";
import { LocalLink } from "./LocalLink";

/** The same trail as on the stay page: parent pages as links, the current page last. */
/** `future` are the steps still ahead (a booking flow): shown in grey, not clickable. */
export function Breadcrumbs({ crumbs, current, future = [] }: { crumbs: { href: string; label: string }[]; current: string; future?: string[] }) {
  const t = useT();
  return (
    <nav aria-label={t("stay.breadcrumb")} className="pb-2 pt-0">
      <ol className="type-body-sm flex min-w-0 flex-wrap items-center gap-1 text-text-secondary">
        {crumbs.map((c) => (
          <li key={c.href} className="flex min-w-0 items-center gap-1">
            <LocalLink href={c.href} className="inline-flex min-h-11 min-w-0 items-center truncate rounded-control px-1 hover:text-text-brand hover:underline">{c.label}</LocalLink>
            <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
          </li>
        ))}
        <li aria-current="page" className="min-w-0 truncate px-1 font-medium text-text-primary">{current}</li>
        {future.map((label) => (
          <li key={label} className="flex min-w-0 items-center gap-1 text-text-disabled">
            <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
            <span className="min-w-0 truncate px-1">{label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

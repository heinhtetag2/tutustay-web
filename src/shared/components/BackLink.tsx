"use client";

import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { cn } from "../lib/cn";

/**
 * "Back" for pages you reach from somewhere else. It goes back in the browser history when this visit started inside the site,
 * so you return to exactly where you were (search results, scroll position), and falls back to the parent page when the page
 * was opened directly from a link or bookmark.
 */
export function BackLink({ fallback = "/", label, className }: { fallback?: string; label?: string; className?: string }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const href = `/${locale}${fallback === "/" ? "" : fallback}`;
  return (
    <a
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        const cameFromSite = window.history.length > 1 && document.referrer.startsWith(window.location.origin);
        if (cameFromSite) router.back(); else router.push(href);
      }}
      className={cn("type-label mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-border-control bg-surface-raised pl-3 pr-5 font-semibold text-text-primary shadow-card transition-colors hover:bg-surface-subtle", className)}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
      {label ?? t("common.back")}
    </a>
  );
}

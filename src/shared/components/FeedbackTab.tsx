"use client";

import { useT } from "@/i18n/I18nProvider";
import { openFeedbackDialog } from "@/shared/hooks/useFeedbackDialog";
import { LocalLink } from "@/shared/components/LocalLink";

/**
 * Usability-test feedback: two slim tabs on the left edge, "Give feedback" (opens the dialog, see features/feedback)
 * and "See feedback" (everything testers have said so far). Neither touches booking, search or sign-in state.
 * Set NEXT_PUBLIC_FEEDBACK=off to hide them (e.g. for a public launch).
 * On small screens they are icon-only handles with a larger tap area, so they do not cover content in the page gutter.
 */
const tab = "relative block cursor-pointer border border-l-0 border-border-subtle bg-surface-raised py-3 pl-0.5 pr-0.5 text-text-primary shadow-raised after:absolute after:-inset-y-1 after:-right-3 after:left-0 after:content-[''] hover:bg-surface-subtle md:px-2";

export function FeedbackTab() {
  const t = useT();
  if (process.env.NEXT_PUBLIC_FEEDBACK === "off") return null;
  return (
    <div className="fixed left-0 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2 print:hidden" data-feedback-tabs>
      <button type="button" onClick={openFeedbackDialog} aria-haspopup="dialog" aria-label={t("feedback.aria")} data-feedback-tab className={`${tab} rounded-r-control md:rounded-r-card`}>
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 md:hidden" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.600 7.100L4 20l1-4.600A8 8 0 1 1 21 12Z" /></svg>
        <span className="type-label hidden rotate-180 [writing-mode:vertical-rl] md:inline">{t("feedback.label")}</span>
      </button>
      <LocalLink href="/feedback" aria-label={t("feedback.seeAria")} data-feedback-results className={`${tab} rounded-r-control md:rounded-r-card`}>
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 md:hidden" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
        <span className="type-label hidden rotate-180 [writing-mode:vertical-rl] md:inline">{t("feedback.see")}</span>
      </LocalLink>
    </div>
  );
}

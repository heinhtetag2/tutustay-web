"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/i18n/I18nProvider";
import { closeAuthDialog, useAuthDialog } from "@/shared/hooks/useAuthDialog";
import { QrCode } from "@/shared/ui/QrCode";
import { AppleLogo, GoogleLogo } from "@/shared/ui/StoreIcons";
import { AuthPanel } from "./AuthPanel";

/** Sign in or create an account without leaving the page (native <dialog>: focus trapped, Escape closes). Mounted once in the layout. */
export function AuthDialog() {
  const t = useT();
  const { open } = useAuthDialog();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref} aria-label={t("auth.dialogTitle")} onClose={closeAuthDialog}
      onClick={(e) => { if (e.target === ref.current) closeAuthDialog(); }}
      className="m-auto max-h-[92dvh] w-[min(94vw,32rem)] overflow-y-auto rounded-sheet lg:w-[min(94vw,58rem)] lg:overflow-hidden bg-surface-raised p-0 text-text-primary shadow-high backdrop:bg-black/50"
    >
      {open ? (
        <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* Wide screens: a side panel that points to the app, with a code to scan from a phone. */}
          <aside className="hidden flex-col items-center justify-center gap-5 bg-surface-brand-subtle p-8 text-center lg:flex">
            <div className="rounded-card bg-surface-raised p-4 shadow-card"><QrCode className="size-36 text-text-primary" /></div>
            <div>
              <h3 className="type-heading">{t("auth.app.title")}</h3>
              <p className="type-body-sm mt-2 text-text-secondary">{t("home.app.body")}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* TODO: replace the App Store address with the real listing once it exists. */}
              <a href="https://apps.apple.com/" rel="noopener" className="type-label inline-flex min-h-10 items-center gap-2 rounded-full bg-text-primary px-4 text-surface-raised transition-opacity hover:opacity-85"><AppleLogo className="size-4" />{t("auth.app.appStore")}</a>
              <a href="https://play.google.com/store/apps/details?id=com.tutustay.app" rel="noopener" className="type-label inline-flex min-h-10 items-center gap-2 rounded-full bg-text-primary px-4 text-surface-raised transition-opacity hover:opacity-85"><GoogleLogo className="size-4" />{t("auth.app.googlePlay")}</a>
            </div>
          </aside>
          <div className="relative max-h-[92dvh] overflow-y-auto p-6 pt-14 sm:p-8 sm:pt-16">
            <button type="button" aria-label={t("common.close")} onClick={closeAuthDialog} className="absolute right-4 top-4 inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <AuthPanel heading="h2" onDone={closeAuthDialog} onNavigate={closeAuthDialog} />
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

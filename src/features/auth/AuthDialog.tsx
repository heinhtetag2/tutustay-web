"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/i18n/I18nProvider";
import { closeAuthDialog, useAuthDialog } from "@/shared/hooks/useAuthDialog";
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
      className="m-auto max-h-[92dvh] w-[min(94vw,32rem)] overflow-y-auto rounded-sheet bg-surface-raised p-0 text-text-primary shadow-high backdrop:bg-black/50"
    >
      {open ? (
        <div className="relative p-6 pt-14 sm:p-8 sm:pt-16">
          <button type="button" aria-label={t("common.close")} onClick={closeAuthDialog} className="absolute right-4 top-4 inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <AuthPanel heading="h2" onDone={closeAuthDialog} onNavigate={closeAuthDialog} />
        </div>
      ) : null}
    </dialog>
  );
}

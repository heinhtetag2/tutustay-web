"use client";

import { useId, useRef, useState } from "react";
import { CANCEL_REASONS, type Booking, type CancelReason } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { transitionBooking } from "@/services/bookings.service";
import { Button } from "@/shared/ui/Button";
import { StatusBanner } from "@/shared/ui/StatusBanner";

/** "Cancel booking" for a booking nothing has been paid on. A confirmation sheet with an optional reason, then the booking becomes cancelled. */
export function CancelBookingDialog({ booking }: { booking: Booking }) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [reason, setReason] = useState<CancelReason | undefined>();
  const close = () => dialog.current?.close();
  const confirm = () => {
    transitionBooking(booking.ref, "cancelled", reason);
    close();
  };

  return (
    <>
      <Button
        variant="secondary" size="lg" aria-haspopup="dialog" onClick={() => { setReason(undefined); dialog.current?.showModal(); }}
        className="w-full border-error-text! bg-error-bg! font-semibold text-error-text! hover:bg-error-bg! hover:opacity-80 sm:w-auto"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="15" rx="2.500" /><path d="M8 3v4M16 3v4M4 10h16M10 13.500l4 4M14 13.500l-4 4" /></svg>
        {t("cancel.action")}
      </Button>
      <dialog
        ref={dialog} aria-labelledby={titleId}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card bg-surface-raised p-0 text-text-primary shadow-[0_8px_32px_#00000040] backdrop:bg-black/60"
      >
        <div className="flex flex-col gap-4 p-6">
          <div>
            <h2 id={titleId} className="type-heading">{t("cancel.title")}</h2>
            <p className="type-body mt-2 text-text-secondary">{t("cancel.body")}</p>
          </div>
          <StatusBanner
            tone="error" title={t("cancel.undone")}
            icon={<svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.500 2.800 19.500h18.400Z" /><path d="M12 10v4.500M12 17.200h.01" /></svg>}
          >{t(booking.mode === "online" ? "cancel.nothingPaidOnline" : "cancel.nothingPaid")}</StatusBanner>
          <fieldset className="flex flex-col gap-2">
            <legend className="type-label mb-2">{t("cancel.why")}</legend>
            {CANCEL_REASONS.map((r) => (
              <label key={r} className="type-body flex min-h-12 cursor-pointer items-center gap-3 rounded-field border border-border-control bg-surface-raised px-4 has-[:checked]:border-error-text has-[:checked]:bg-error-bg">
                <input type="radio" name={`cancel-reason-${titleId}`} value={r} checked={reason === r} onChange={() => setReason(r)} className="size-5 accent-[var(--color-error-text)]" />
                {t(`cancel.reason.${r}`)}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-2">
            <Button variant="danger" size="lg" onClick={confirm}>{t("cancel.confirm")}</Button>
            <Button variant="ghost" size="lg" onClick={close}>{t("cancel.keep")}</Button>
          </div>
        </div>
      </dialog>
    </>
  );
}

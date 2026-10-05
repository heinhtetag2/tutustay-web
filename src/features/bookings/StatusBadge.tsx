"use client";

import type { BookingStatus } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { Badge, type Tone } from "@/shared/ui/Badge";

const TONE: Record<BookingStatus, Tone> = {
  pending: "info", accepted: "warning", confirmed: "success", overdue: "error",
  rejected: "error", cancelled: "neutral", completed: "neutral",
};

/** Status vocabulary is fixed (docs/02): always text + tone, never colour alone. */
export function StatusBadge({ status }: { status: BookingStatus }) {
  const t = useT();
  return <Badge tone={TONE[status]}>{t(`status.${status}`)}</Badge>;
}

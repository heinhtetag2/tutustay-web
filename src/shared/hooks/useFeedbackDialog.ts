"use client";

import { useSyncExternalStore } from "react";

/** Shared open flag for the feedback dialog (same pattern as useAuthDialog). */
let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openFeedbackDialog(): void { open = true; emit(); }
export function closeFeedbackDialog(): void { if (open) { open = false; emit(); } }

export function useFeedbackDialog(): boolean {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => open, () => open);
}

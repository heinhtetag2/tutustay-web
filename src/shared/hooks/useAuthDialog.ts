"use client";

import { useSyncExternalStore } from "react";

/** Tiny shared flag for the sign-in dialog, so the header, the "sign in to continue" prompts and the dialog itself stay in step. */
interface State { open: boolean }
let state: State = { open: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openAuthDialog(): void { state = { open: true }; emit(); }
export function closeAuthDialog(): void { if (state.open) { state = { open: false }; emit(); } }

export function useAuthDialog(): State {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state,
    () => state,
  );
}

"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False on the server and during hydration, true after. Avoids flashing signed-out UI for signed-in users. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

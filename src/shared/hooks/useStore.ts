"use client";

import { useSyncExternalStore } from "react";
import type { LocalStore } from "@/services/mocks/localStore";

/** Subscribe a component to a mock store. Renders the initial value on the server and first paint. */
export function useStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServerSnapshot);
}

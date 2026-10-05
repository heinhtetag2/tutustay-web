"use client";

import { sessionStore } from "@/services/auth.service";
import { useStore } from "./useStore";

export function useMockSession() {
  return useStore(sessionStore);
}

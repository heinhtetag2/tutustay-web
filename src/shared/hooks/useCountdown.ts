"use client";

import { useEffect, useState } from "react";

/** Milliseconds left until `at`, ticking every second. Null until mounted so the server and client markup match. */
export function useCountdown(at: number | null): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now === null || at === null ? null : Math.max(0, at - now);
}

/** 1:05:09 or 24:09, whichever is shorter. */
export function formatCountdown(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const two = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${two(m)}:${two(sec)}` : `${two(m)}:${two(sec)}`;
}

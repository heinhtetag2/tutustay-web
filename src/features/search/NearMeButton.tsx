"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { Button } from "@/shared/ui/Button";

type State = "idle" | "asking" | "denied" | "unavailable";

/**
 * "Stay near you". Follows the Location Service Policy: read once, only on this action, never stored,
 * explain before asking, and denial leaves everything working (search by place instead).
 */
export function NearMeButton({ active }: { active: boolean }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [state, setState] = useState<State>("idle");

  function go(near: string | null) {
    const q = new URLSearchParams(params.toString());
    if (near) q.set("near", near); else q.delete("near");
    if (!pathname.endsWith("/search")) { router.push(`/${locale}/search?${q.toString()}`); return; }
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  }

  function ask() {
    if (!("geolocation" in navigator)) { setState("unavailable"); return; }
    setState("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setState("idle"); go(`${pos.coords.latitude.toFixed(3)},${pos.coords.longitude.toFixed(3)}`); },
      () => setState("denied"),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {active ? (
        <Button variant="secondary" onClick={() => go(null)}>{t("near.stop")}</Button>
      ) : (
        <Button variant="secondary" loading={state === "asking"} onClick={ask}>{t("near.button")}</Button>
      )}
      <p className="type-body-sm text-text-secondary">{t("near.explain")}</p>
      {state === "denied" ? <p role="status" className="type-body-sm text-warning-text">{t("near.denied")}</p> : null}
      {state === "unavailable" ? <p role="status" className="type-body-sm text-warning-text">{t("near.unavailable")}</p> : null}
    </div>
  );
}

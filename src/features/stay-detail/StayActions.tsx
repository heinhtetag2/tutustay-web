"use client";

import { useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { favoritesStore } from "@/services/preferences.service";
import { useStore } from "@/shared/hooks/useStore";

const action = "type-label inline-flex min-h-11 items-center gap-2 rounded-control px-3 underline underline-offset-4 hover:bg-surface-subtle";

/** Share (falls back to copying the link) and Save to wishlist, as quiet text actions in the title row. */
export function StayActions({ stayId, name }: { stayId: string; name: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const saved = useStore(favoritesStore);
  const isSaved = saved.includes(stayId);

  async function copy() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard blocked: nothing to recover */ }
  }
  async function share() {
    try {
      if (navigator.share) { await navigator.share({ title: name, url: window.location.href }); return; }
    } catch { return; /* dismissed */ }
    await copy();
  }

  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={share} className={action}>
        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 10V2M5 4.5 8 2l3 2.5M3 8v5.5h10V8" /></svg>
        {t("stay.share")}
      </button>
      <button type="button" aria-pressed={isSaved} onClick={() => favoritesStore.set(isSaved ? saved.filter((id) => id !== stayId) : [...saved, stayId])} className={action}>
        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M8 13.5S2 10 2 5.9C2 4.2 3.3 3 4.8 3c1.2 0 2.4.7 3.2 1.9C8.800 3.700 10 3 11.200 3 12.700 3 14 4.200 14 5.900 14 10 8 13.500 8 13.500Z" /></svg>
        {isSaved ? t("stay.unsave") : t("stay.save")}
      </button>
      <span role="status" className="type-body-sm text-success-text">{copied ? t("stay.linkCopied") : ""}</span>
    </div>
  );
}

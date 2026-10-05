"use client";

import { useT } from "@/i18n/I18nProvider";
import { compareStore, MAX_COMPARE } from "@/services/preferences.service";
import { useStore } from "@/shared/hooks/useStore";

/** "Compare" check on a result's photo. Capped at MAX_COMPARE; the rest are disabled until one is removed. */
export function CompareToggle({ stayId, name }: { stayId: string; name: string }) {
  const t = useT();
  const picked = useStore(compareStore);
  const on = picked.includes(stayId);
  const full = !on && picked.length >= MAX_COMPARE;
  return (
    <label
      title={full ? t("compare.full", { n: MAX_COMPARE }) : undefined}
      className={`type-label inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-control px-2 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--border-focus)] ${on ? "text-text-brand" : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"} ${full ? "cursor-not-allowed opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={on}
        disabled={full}
        aria-label={t(on ? "compare.remove" : "compare.add", { name })}
        onChange={() => compareStore.set(on ? picked.filter((id) => id !== stayId) : [...picked, stayId])}
        className="size-4 accent-[var(--action-primary)] outline-none"
      />
      {t("compare.label")}
    </label>
  );
}

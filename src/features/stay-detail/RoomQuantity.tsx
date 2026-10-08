"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { parseSelection, serializeSelection } from "./selection";

/** Picks how many of this room to book, 0 to `max`. It writes `sel` in the URL, which the summary and the booking step read. */
export function RoomQuantity({ roomId, value, max, name }: { roomId: string; value: number; max: number; name: string }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const set = (n: number) => {
    const next = new URLSearchParams(search.toString());
    const sel = { ...parseSelection(next.get("sel") ?? undefined), [roomId]: n };
    const text = serializeSelection(sel);
    if (text) next.set("sel", text); else next.delete("sel");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  const btn = "inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border-control bg-surface-raised text-lg leading-none transition-colors hover:border-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-control";
  if (value === 0) {
    return (
      <button type="button" onClick={() => set(1)} aria-label={t("room.select", { name })} className="type-label inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-text-brand px-6 text-text-brand transition-colors hover:bg-surface-brand-subtle">
        {t("room.selectShort")}
      </button>
    );
  }
  return (
    <div role="group" aria-label={t("room.quantity", { name })} className="flex items-center gap-3">
      <button type="button" aria-label={value === 1 ? t("room.remove", { name }) : t("room.quantityLess")} onClick={() => set(value - 1)} className={btn}>−</button>
      <span aria-live="polite" className="type-label w-6 text-center">{value}</span>
      <button type="button" aria-label={t("room.quantityMore")} disabled={value >= max} onClick={() => set(value + 1)} className={btn}>+</button>
    </div>
  );
}

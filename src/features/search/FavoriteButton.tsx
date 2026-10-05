"use client";

import { useT } from "@/i18n/I18nProvider";
import { favoritesStore } from "@/services/preferences.service";
import { useStore } from "@/shared/hooks/useStore";

/** Save a stay (the live site has Favorites). Mock: stored in this browser. A real version needs the account. */
export function FavoriteButton({ stayId, name, overlay }: { stayId: string; name: string; overlay?: boolean }) {
  const t = useT();
  const saved = useStore(favoritesStore);
  const on = saved.includes(stayId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={t(on ? "fav.remove" : "fav.add", { name })}
      onClick={(e) => {
        e.preventDefault(); // the card is a link: don't navigate
        e.stopPropagation();
        favoritesStore.set(on ? saved.filter((id) => id !== stayId) : [...saved, stayId]);
      }}
      className={`inline-flex size-11 items-center justify-center rounded-full transition-transform hover:scale-110 ${overlay ? "text-[#ffffff] [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.55))]" : "text-text-primary hover:bg-surface-subtle"}`}
    >
      <span key={String(on)} aria-hidden className={`text-2xl leading-none ${on ? "anim-heart " : ""}${on ? (overlay ? "text-[#ff385c]" : "text-error-text") : ""}`}>{on ? "♥" : "♡"}</span>
    </button>
  );
}

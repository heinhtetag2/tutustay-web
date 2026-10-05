"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/I18nProvider";

export const PRICE_CAP = 300_000;
const STEP = 10_000;

const fmt = (n: number) => n.toLocaleString("en-US");
const parse = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;

/**
 * One two-thumb slider with Min and Max boxes that always show real values and stay in sync with the slider.
 * The top end means "no maximum" (shown as 300,000+). Commits to the URL on release, blur or Enter, so the list
 * doesn't thrash while dragging.
 */
export function PriceRange({ min, max, onCommit }: { min?: number; max?: number; onCommit: (min?: number, max?: number) => void }) {
  const t = useT();
  const [lo, setLo] = useState(min ?? 0);
  const [hi, setHi] = useState(max ?? PRICE_CAP);
  const [loText, setLoText] = useState<string | null>(null); // while typing; null = show the formatted value
  const [hiText, setHiText] = useState<string | null>(null);

  // Follow the URL when it changes elsewhere (clear filters, back button).
  useEffect(() => { setLo(min ?? 0); setHi(max ?? PRICE_CAP); }, [min, max]);

  const commit = (a = lo, b = hi) => onCommit(a <= 0 ? undefined : a, b >= PRICE_CAP ? undefined : b);
  const clamp = (n: number) => Math.min(PRICE_CAP, Math.max(0, n));
  const pct = (n: number) => `${(n / PRICE_CAP) * 100}%`;

  const finishLo = () => { const v = Math.min(clamp(parse(loText ?? String(lo))), hi); setLo(v); setLoText(null); commit(v, hi); };
  const finishHi = () => { const raw = hiText ?? ""; const v = raw.trim() === "" ? PRICE_CAP : Math.max(clamp(parse(raw)), lo); setHi(v); setHiText(null); commit(lo, v); };

  const box = "min-h-11 w-full rounded-field border border-border-control bg-surface-raised pl-9 pr-2 type-body";
  const label = "type-body-sm text-text-secondary";

  return (
    <div className="flex flex-col gap-3">
      <p className="type-label" aria-live="polite">Ks {fmt(lo)} – {hi >= PRICE_CAP ? `${fmt(PRICE_CAP)}+` : fmt(hi)}</p>

      <div className="dual-range mx-3" role="group" aria-label={t("filter.price")}>
        <div className="track" />
        <div className="fill" style={{ left: pct(lo), right: `calc(100% - ${pct(hi)})` }} />
        <input
          type="range" aria-label={t("filter.minSlider")} min={0} max={PRICE_CAP} step={STEP} value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
          onPointerUp={() => commit()} onKeyUp={() => commit()}
        />
        <input
          type="range" aria-label={t("filter.maxSlider")} min={0} max={PRICE_CAP} step={STEP} value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
          onPointerUp={() => commit()} onKeyUp={() => commit()}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={label}>{t("filter.minShort")}</span>
          <span className="relative">
            <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary type-body-sm">Ks</span>
            <input
              className={box} inputMode="numeric" autoComplete="off" value={loText ?? fmt(lo)}
              onFocus={(e) => { setLoText((cur) => cur ?? String(lo)); e.currentTarget.select(); }}
              onChange={(e) => setLoText(e.target.value.replace(/[^0-9]/g, ""))}
              onBlur={finishLo} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
          </span>
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>{t("filter.maxShort")}</span>
          <span className="relative">
            <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary type-body-sm">Ks</span>
            <input
              className={box} inputMode="numeric" autoComplete="off" placeholder={t("filter.noMax")} value={hiText ?? (hi >= PRICE_CAP ? `${fmt(PRICE_CAP)}+` : fmt(hi))}
              onFocus={(e) => { setHiText((cur) => cur ?? (hi >= PRICE_CAP ? "" : String(hi))); e.currentTarget.select(); }}
              onChange={(e) => setHiText(e.target.value.replace(/[^0-9]/g, ""))}
              onBlur={finishHi} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
          </span>
        </label>
      </div>
    </div>
  );
}

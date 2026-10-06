"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface HeroSlide { src: string; title: string; subtitle: string; position?: string }

const INTERVAL_MS = 6500;

/**
 * Hero banner whose photo, title and subtitle change together every few seconds (crossfade, text rises in, slow zoom).
 * All slides sit stacked in one grid cell so the height never jumps. Under reduced motion it stays on the first slide.
 * The search bar is passed as children so it stays put while the text changes.
 */
export function HeroCarousel({ slides, children }: { slides: HeroSlide[]; children: ReactNode }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <div
      className="relative isolate flex min-h-[100svh] items-center justify-center text-center"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden bg-[#1c2a1a]">
        {slides.map((s, k) => (
          // eslint-disable-next-line @next/next/no-img-element -- local demo assets, sized by the parent
          <img
            key={s.src} src={s.src} alt="" decoding="async"
            style={{ objectPosition: s.position ?? "center 30%" }}
            className={`absolute inset-0 size-full object-cover transition-[opacity,transform] ease-out ${k === i ? "scale-[1.06] opacity-100 duration-[1400ms,9000ms]" : "scale-100 opacity-0 duration-[1400ms,0ms]"}`}
          />
        ))}
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0000004d] via-[#00000014] to-[#00000040]" />

      <div className="w-full px-4 pb-8 pt-28 sm:px-6 md:px-8 md:pb-24 md:pt-36">
        <div className="mx-auto grid max-w-4xl">
          {slides.map((s, k) => (
            <div
              key={s.src} aria-hidden={k !== i} role="group" aria-roledescription="slide"
              className={`col-start-1 row-start-1 transition-[opacity,transform,filter] duration-700 ease-out ${k === i ? "translate-y-0 opacity-100 blur-0 delay-300" : "pointer-events-none translate-y-4 opacity-0 blur-sm"}`}
            >
              <h1 className={`type-display text-[#fff] [text-shadow:0_2px_16px_#00000066] ${k === 0 ? "" : "[&]:font-semibold"}`}>{k === 0 ? s.title : <span role="presentation">{s.title}</span>}</h1>
              <p className="type-body mx-auto mt-4 max-w-2xl text-[#ffffffe6] [text-shadow:0_1px_10px_#000000b3]">{s.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="anim-rise mx-auto mt-10 max-w-5xl text-left" style={{ "--i": 3 } as React.CSSProperties}>{children}</div>

        {slides.length > 1 ? (
          <div className="mt-6 flex justify-center gap-2" role="group" aria-label="Banner">
            {slides.map((s, k) => (
              <button
                key={s.src} type="button" aria-label={`${k + 1} / ${slides.length}`} aria-current={k === i ? "true" : undefined} onClick={() => setI(k)}
                className="flex size-10 items-center justify-center"
              >
                <span className={`block h-1.5 rounded-full bg-[#fff] transition-all duration-500 ${k === i ? "w-6 opacity-100" : "w-1.5 opacity-50"}`} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

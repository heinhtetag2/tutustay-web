"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** A glossy 3D-style trophy and star, in the brand blue, used either side of an overall score. */
function Trophy({ id }: { id: string }) {
  return (
    <svg aria-hidden viewBox="0 0 64 64" className="size-9 drop-shadow-[0_3px_5px_#0369a133] sm:size-11">
      <defs>
        <linearGradient id={`${id}-cup`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7DD3FC" /><stop offset="0.55" stopColor="#0EA5E9" /><stop offset="1" stopColor="#0369A1" /></linearGradient>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38BDF8" /><stop offset="1" stopColor="#075985" /></linearGradient>
      </defs>
      <path d="M13 14c-6 0-8 4-7 8 1 5 6 9 12 10" fill="none" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
      <path d="M51 14c6 0 8 4 7 8-1 5-6 9-12 10" fill="none" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 8h36v14c0 11-8 19-18 19S14 33 14 22Z" fill={`url(#${id}-cup)`} />
      <path d="M19 11h6c-2 12-1 22 5 27-8-1-11-9-11-17Z" fill="#fff" opacity=".4" />
      <rect x="28" y="40" width="8" height="9" fill={`url(#${id}-base)`} />
      <path d="M20 50h24l3 8H17Z" fill={`url(#${id}-base)`} />
      <path d="M20 50h24l1 3H19Z" fill="#fff" opacity=".35" />
    </svg>
  );
}

/** A glossy brand-blue star. */
const Spark = ({ id, seen, delay }: { id: string; seen: boolean; delay: number }) => (
  <svg aria-hidden viewBox="0 0 24 24" style={{ transitionDelay: `${delay}ms` }} className={`size-5 drop-shadow-[0_2px_3px_#0369a133] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:size-6 ${seen ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-45 opacity-0"}`}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#BAE6FD" /><stop offset="0.5" stopColor="#38BDF8" /><stop offset="1" stopColor="#0284C7" /></linearGradient></defs>
    <path d="M12 2.200 14.900 8.300l6.600.9-4.800 4.600 1.200 6.600L12 17.300l-5.900 3.100 1.200-6.600L2.500 9.200l6.600-.9Z" fill={`url(#${id})`} stroke="url(#${id})" strokeWidth="1.600" strokeLinejoin="round" />
    <path d="M12 4.800 14 9.200l-2 .5-3.800-.3Z" fill="#fff" opacity=".35" />
  </svg>
);

/** The score sits between two trophies; each trophy has a star above and below on the side facing the score. */
function Side({ id, flip = false, seen }: { id: string; flip?: boolean; seen: boolean }) {
  return (
    <div className={`flex items-stretch ${flip ? "flex-row-reverse" : ""}`}>
      <div
        style={{ transitionDelay: "150ms" }}
        className={`flex items-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${flip ? "-ml-3 sm:-ml-4" : "-mr-3 sm:-mr-4"} ${seen ? "translate-x-0 scale-100 opacity-100" : `${flip ? "-translate-x-6" : "translate-x-6"} scale-50 opacity-0`}`}
      >
        <Trophy id={id} />
      </div>
      <div className="flex flex-col justify-between py-1"><Spark id={`${id}-s1`} seen={seen} delay={550} /><Spark id={`${id}-s2`} seen={seen} delay={700} /></div>
    </div>
  );
}

/** Counts up to `value` once `run` is true (instantly under reduced motion). */
function useCountUp(value: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(value); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 1100);
      setN(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, run]);
  return n;
}

/** Overall rating in the Fresha style: the big score between two trophies, the rating word, and what it is based on. */
export function RatingHero({ score, label, basedOn }: { score: number; label: ReactNode; basedOn: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const shown = useCountUp(score, seen);
  const rise = (delay: number): CSSProperties => ({ transitionDelay: `${delay}ms` });
  const riseCls = `transition-[opacity,transform] duration-700 ease-out ${seen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`;
  return (
    <div ref={root} className="flex flex-col items-center text-center">
      <div className="flex items-stretch gap-2 sm:gap-4">
        <Side id="tl" seen={seen} />
        <p aria-label={score.toFixed(1)} className="self-center text-[4.5rem] font-bold leading-none tracking-tight tabular-nums sm:text-[6rem]">{seen ? shown.toFixed(1) : "0.0"}</p>
        <Side id="tr" flip seen={seen} />
      </div>
      <p style={rise(900)} className={`mt-4 text-xl font-semibold leading-7 ${riseCls}`}>{label}</p>
      <p style={rise(1050)} className={`mt-1 text-base text-text-secondary ${riseCls}`}>{basedOn}</p>
    </div>
  );
}

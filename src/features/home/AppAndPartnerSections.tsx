import type { ReactNode } from "react";
import { createT } from "@/i18n/translate";
import type { Locale } from "@/i18n/config";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { LinkButton } from "@/shared/ui/Button";

type Cover = { name: string; place: string; price: string; src?: string };

/** A phone drawn in CSS: thick dark frame, big rounded screen. */
function Phone({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`overflow-hidden rounded-[2.75rem] border-[9px] border-text-primary bg-surface-raised ${className}`}>{children}</div>;
}

const Stars = ({ className = "size-4" }: { className?: string }) => (
  <span className="inline-flex gap-0.5 text-[#f5b301]" aria-hidden>
    {[0, 1, 2, 3, 4].map((i) => <svg key={i} viewBox="0 0 16 16" className={className} fill="currentColor"><path d="m8 1.200 2 4.300 4.600.600-3.400 3.200.9 4.600L8 11.600 3.900 13.900l.9-4.600L1.400 6.100 6 5.500Z" /></svg>)}
  </span>
);

const StoreIcons = () => (
  <span aria-hidden className="flex items-center gap-2.5">
    <svg viewBox="0 0 24 24" className="size-7"><rect x="1" y="1" width="22" height="22" rx="5.500" fill="currentColor" /><g fill="none" stroke="#fff" strokeWidth="1.800" strokeLinecap="round"><path d="m12 5.500-5 9.500" /><path d="m12 5.500 5 9.500" /><path d="M8.600 12.800h8M6.200 17.500h4M14 17.500h3.800" /></g></svg>
    <svg viewBox="0 0 24 24" className="size-7" fill="currentColor"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.490 1.490 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.600l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.450.195a1.466 1.466 0 0 0-.946-.179l11.040 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.540-3.230-3.210z" /></svg>
  </span>
);

/** "Download the app": a huge headline on the left, two tall phones on the right (a stay page and a results list). */
export function AppSection({ locale, covers }: { locale: Locale; covers: Cover[] }) {
  const t = createT(locale);
  const [a, b, c] = covers;
  return (
    <section aria-labelledby="home-app" className="grid items-center gap-12 py-12 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
      <div>
        <p className="flex items-center gap-3 text-base font-semibold">{t("home.app.available")}<StoreIcons /></p>
        <h2 id="home-app" className="mt-8 max-w-xl text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{t("home.app.title")}</h2>
        <p className="mt-6 max-w-lg text-xl leading-8 sm:text-2xl sm:leading-9">{t("home.app.body")}</p>
        <LinkButton href="/download" size="lg" className="mt-10 min-h-14 px-8 text-lg">{t("home.app.cta")}</LinkButton>
      </div>

      <div aria-hidden className="relative mx-auto h-[34rem] w-full max-w-[36rem] sm:h-[44rem]">
        {/* Phone 1: our stay page. */}
        <Phone className="absolute left-0 top-0 h-[32rem] w-[15.5rem] sm:h-[40rem] sm:w-[19rem]">
          <div className="relative h-[40%]">
            {a?.src ? <PhotoTile src={a.src} alt="" className="absolute inset-0 size-full" /> : null}
            <span className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-full bg-surface-raised shadow-raised"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></span>
            <span className="absolute right-12 top-3 flex size-8 items-center justify-center rounded-full bg-surface-raised shadow-raised"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6" /></svg></span>
            <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-surface-raised shadow-raised"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 20s-7-4.500-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.500-7 10-7 10Z" /></svg></span>
            <span className="absolute bottom-3 right-3 rounded-full bg-[#00000099] px-2.5 py-1 text-[0.7rem] font-medium text-[#fff]">1/6</span>
          </div>
          <div className="flex flex-col gap-1.5 p-4 sm:p-5">
            <p className="text-lg font-semibold leading-6 sm:text-xl">{a?.name}</p>
            <p className="flex items-center gap-2 text-xs sm:text-sm"><svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor"><path d="m8 1.200 2 4.300 4.600.600-3.400 3.200.9 4.600L8 11.600 3.900 13.900l.9-4.600L1.400 6.100 6 5.500Z" /></svg>{t("rating.fantastic")} · 4.8</p>
            <p className="text-xs text-text-secondary sm:text-sm">{a?.place}</p>
            <span className="mt-1 inline-flex w-fit rounded-full bg-surface-brand-subtle px-2.5 py-1 text-[0.7rem] font-medium text-text-brand sm:text-xs">{t("home.app.pay")}</span>
            <div className="mt-3 flex flex-col gap-3 border-t border-border-subtle pt-4 text-xs sm:text-sm"><span>{t("home.app.m1")}</span><span>{t("home.app.m2")}</span><span>{t("home.app.m3")}</span></div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border-subtle bg-surface-raised px-4 py-3 sm:px-5">
            <span className="text-xs sm:text-sm"><b className="text-sm sm:text-base">{a?.price}</b> {t("home.app.night")}</span>
            <span className="rounded-full bg-action-cta px-5 py-2.5 text-xs font-medium text-text-on-action sm:text-sm">{t("booking.reserve")}</span>
          </div>
        </Phone>

        {/* Phone 2: our search screen, a map with price pins above the results. */}
        <Phone className="absolute right-0 top-24 h-[28rem] w-[14rem] sm:top-36 sm:h-[34rem] sm:w-[16.5rem]">
          <div className="m-3 rounded-full border border-border-subtle px-4 py-2 text-xs shadow-[0_2px_8px_#00000014] sm:text-sm"><span className="font-semibold">{t("home.app.anywhere")}</span> <span className="text-text-secondary">· 7 Oct – 8 Oct</span></div>
          <div className="relative h-36 overflow-hidden bg-[#f2efe9] sm:h-44">
            <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
              <path d="M0 20C40 30 60 5 110 12S170 40 200 28V0H0Z" fill="#aad3df" />
              <rect x="120" y="70" width="55" height="45" rx="6" fill="#cfe8c4" />
              <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"><path d="M-5 60 205 90" /><path d="M60 0 90 145" /><path d="M150 30 130 145" /><path d="M0 110 210 118" /></g>
              <path d="M-5 45 205 75" fill="none" stroke="#f7b69b" strokeWidth="6" strokeLinecap="round" />
            </svg>
            {[[b, "18%", "34%"], [c, "52%", "58%"], [a, "62%", "18%"]].map(([x, l, tp], i) => (
              <span key={i} className={`absolute -translate-x-1/2 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold shadow-raised ${i === 1 ? "bg-text-primary text-surface-raised" : "bg-surface-raised"}`} style={{ left: l as string, top: tp as string }}>{(x as Cover | undefined)?.price.replace("Ks ", "")}</span>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-hidden px-3 py-3">
            {[t("home.app.sort"), t("home.app.types"), t("filter.popular")].map((x) => <span key={x} className="shrink-0 rounded-full border border-border-subtle px-3 py-1.5 text-[0.65rem] font-medium sm:text-xs">{x}</span>)}
          </div>
          <div className="px-3">
            <div className="relative h-24 overflow-hidden rounded-2xl sm:h-28">{c?.src ? <PhotoTile src={c.src} alt="" className="absolute inset-0 size-full" /> : null}</div>
            <p className="mt-2 text-xs font-semibold sm:text-sm">{c?.name}</p>
            <p className="text-[0.7rem] text-text-secondary sm:text-xs">{c?.place} · {c?.price}</p>
          </div>
        </Phone>
      </div>
    </section>
  );
}

const COLUMNS = ["Standard Double", "Deluxe Twin", "Family Suite"];
const BLOCKS: { col: number; row: number; span: number; tone: string; who: string; what: string }[] = [
  { col: 0, row: 0, span: 2, tone: "bg-[#bae6fd]", who: "Aung K.", what: "Overnight" },
  { col: 1, row: 0, span: 2, tone: "bg-[#fbcfe8]", who: "Thida M.", what: "Overnight" },
  { col: 2, row: 1, span: 2, tone: "bg-[#99f6e4]", who: "Min S.", what: "Session · 6 hours" },
  { col: 0, row: 3, span: 2, tone: "bg-[#fde68a]", who: "Nandar L.", what: "Daycation" },
  { col: 1, row: 3, span: 1, tone: "bg-[#99f6e4]", who: "Kyaw Z.", what: "Session · 3 hours" },
];

/** "For partners": full-bleed gradient panel. Huge headline, a rating line and a button on the left; a big calendar dashboard that runs off the right edge, with a phone over it. */
export function PartnerSection({ locale, cover, score, stays }: { locale: Locale; cover?: Cover; score: number; stays: number }) {
  const t = createT(locale);
  return (
    <section aria-labelledby="home-biz" className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_100%_60%,#bae6fd_0%,#e0f2fe_35%,#fff_70%)] py-14 md:py-20">
      <div className="mx-auto grid max-w-[var(--container-content)] gap-12 px-[var(--gutter)] lg:min-h-[40rem] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="relative z-10 flex flex-col justify-between gap-12">
          <div>
            <h2 id="home-biz" className="max-w-xl text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{t("home.biz.title")}</h2>
            <p className="mt-6 max-w-md text-xl leading-8 sm:text-2xl sm:leading-9">{t("home.biz.body")}</p>
            <LinkButton href="/partners" size="lg" className="mt-8 min-h-14 px-8 text-lg">{t("home.biz.cta")} <span aria-hidden>→</span></LinkButton>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight">{t("home.biz.rating", { score: score.toFixed(1) })}</p>
            <Stars className="mt-2 size-8" />
            <p className="mt-3 text-base">{t("home.biz.basis", { n: stays })}</p>
          </div>
        </div>

        <div aria-hidden className="relative hidden lg:block">
          <div className="absolute left-0 top-0 w-[56rem] overflow-hidden rounded-[1.75rem] border-[8px] border-text-primary bg-surface-raised shadow-high">
            <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4"><span className="size-3 rounded-full bg-brand" /><span className="text-lg font-semibold">TuTuStay</span></div>
            <div className="grid grid-cols-[3.5rem_1fr]">
              <div className="flex flex-col items-center gap-5 bg-text-primary py-5">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="size-6 rounded-md border-2 border-surface-raised opacity-80" />)}</div>
              <div>
                <div className="grid grid-cols-3 gap-3 px-4 pb-2 pt-4">
                  {COLUMNS.map((c, i) => (
                    <div key={c} className="flex flex-col items-center gap-1.5">
                      <span className="flex size-12 items-center justify-center rounded-full bg-surface-brand-subtle text-base font-semibold text-text-brand">{c[0]}</span>
                      <span className="text-xs text-text-secondary">{c}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 p-4" style={{ gridTemplateRows: "repeat(5, 4.25rem)" }}>
                  {BLOCKS.map((b, i) => (
                    <div key={i} className={`flex flex-col justify-start rounded-xl px-3 py-2.5 text-sm leading-5 ${b.tone}`} style={{ gridColumn: `${b.col + 1}`, gridRow: `${b.row + 1} / span ${b.span}` }}>
                      <span className="font-semibold">{b.who}</span><span>{b.what}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {cover ? (
            <Phone className="absolute -left-16 bottom-0 h-[24rem] w-[14rem] shadow-high">
              <div className="relative h-[42%]">{cover.src ? <PhotoTile src={cover.src} alt="" className="absolute inset-0 size-full" /> : null}</div>
              <div className="p-4"><p className="text-base font-semibold leading-5">{cover.name}</p><p className="mt-1.5 flex items-center gap-1.5 text-xs">4.8 <Stars className="size-3" /></p><p className="mt-1.5 text-xs text-text-secondary">{cover.place}</p></div>
            </Phone>
          ) : null}
        </div>
      </div>
    </section>
  );
}

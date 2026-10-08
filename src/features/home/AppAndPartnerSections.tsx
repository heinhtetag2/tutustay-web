import type { ReactNode } from "react";
import { createT } from "@/i18n/translate";
import type { Locale } from "@/i18n/config";
import { PhotoTile } from "@/shared/ui/PhotoTile";
import { LinkButton } from "@/shared/ui/Button";
import { StoreIcons } from "@/shared/ui/StoreIcons";

type Cover = { name: string; place: string; price: string; src?: string };

/** A phone drawn in CSS: thick dark frame, big rounded screen. */
function Phone({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`overflow-hidden rounded-[2.25rem] border-[3px] border-text-primary bg-surface-raised ${className}`}>{children}</div>;
}

const Stars = ({ className = "size-4" }: { className?: string }) => (
  <span className="inline-flex gap-0.5 text-[#f5b301]" aria-hidden>
    {[0, 1, 2, 3, 4].map((i) => <svg key={i} viewBox="0 0 16 16" className={className} fill="currentColor"><path d="m8 1.200 2 4.300 4.600.600-3.400 3.200.9 4.600L8 11.600 3.900 13.900l.9-4.600L1.400 6.100 6 5.500Z" /></svg>)}
  </span>
);


/** A placeholder QR code (a fixed pattern, not scannable) until the real store link exists. */
function QrCode() {
  const n = 25;
  const finder = (x: number, y: number) => ([[0, 0], [n - 7, 0], [0, n - 7]] as const).some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const cells: string[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (finder(x, y) || x === 7 || y === 7 || (x > n - 9 && y === 7)) continue;
    if (((x * 7 + y * 13 + x * y * 5) % 11) % 3 === 0 || (x * y) % 7 === 3) cells.push(`M${x} ${y}h1v1h-1z`);
  }
  const eye = (x: number, y: number) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg aria-hidden viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="size-28" fill="currentColor" shapeRendering="crispEdges">
      <path d={cells.join("")} /><path fillRule="evenodd" d={eye(0, 0) + eye(n - 7, 0) + eye(0, n - 7)} />
    </svg>
  );
}



/** "Download the app": a huge headline on the left, two tall phones on the right (a stay page and a results list). */
export function AppSection({ locale, covers }: { locale: Locale; covers: Cover[] }) {
  const t = createT(locale);
  const [a, b, c] = covers;
  return (
    <section aria-labelledby="home-app" className="py-12 md:py-16">
      <div className="mx-auto grid max-w-[var(--container-content)] items-center gap-12 px-[var(--gutter)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
      <div>
        <p className="flex items-center gap-3 text-base font-semibold">{t("home.app.available")}<StoreIcons /></p>
        <h2 id="home-app" className="mt-6 max-w-xl text-balance type-display">{t("home.app.title")}</h2>
        <p className="type-body mt-4 max-w-lg text-text-secondary">{t("home.app.body")}</p>
        <LinkButton href="/download" size="lg" className="mt-8">{t("home.app.cta")}</LinkButton>
        <div className="mt-8 hidden w-fit rounded-card border border-border-subtle p-4 lg:block"><QrCode /></div>
      </div>

      <div aria-hidden className="relative mx-auto h-[36rem] w-full max-w-[36rem] sm:h-[43.5rem]">
        {/* Phone 1: the app home screen. Phone 2: a reservation waiting for the hotel. Both are screenshots of the real app. */}
        <Phone className="absolute left-0 top-0 h-[31rem] w-[14.25rem] sm:h-[39.5rem] sm:w-[18rem]">
          <img src="/app/home.webp" alt="" className="size-full object-cover object-top" />
        </Phone>
        <Phone className="absolute right-0 top-16 h-[27rem] w-[12.25rem] sm:top-20 sm:h-[33.5rem] sm:w-[15.25rem]">
          <img src="/app/reservation.webp" alt="" className="size-full object-cover object-top" />
        </Phone>
      </div>
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
    <section aria-labelledby="home-biz" className="pt-12 pb-20 md:pt-16 md:pb-28">
      <div className="mx-auto grid max-w-[var(--container-content)] gap-12 px-[var(--gutter)] lg:min-h-[30rem] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12">
        <div className="relative z-10 flex flex-col justify-between gap-12 lg:order-2">
          <div>
            <h2 id="home-biz" className="max-w-xl type-display">{t("home.biz.title")}</h2>
            <p className="type-body mt-4 max-w-lg text-text-secondary">{t("home.biz.body")}</p>
            <LinkButton href="/partners" size="lg" className="mt-8">{t("home.biz.cta")} <span aria-hidden>→</span></LinkButton>
          </div>
          <div>
            <p className="type-title">{t("home.biz.rating", { score: score.toFixed(1) })}</p>
            <Stars className="mt-2 size-6" />
            <p className="mt-3 text-base">{t("home.biz.basis", { n: stays })}</p>
          </div>
        </div>

        <div aria-hidden className="relative hidden lg:order-1 lg:block">
          <div className="absolute left-0 top-0 w-[calc(100%-3rem)] overflow-hidden rounded-[1.75rem] border-[8px] border-text-primary bg-surface-raised shadow-high">
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
                <div className="grid grid-cols-3 gap-3 p-4" style={{ gridTemplateRows: "repeat(5, 3.5rem)" }}>
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
            <Phone className="absolute right-0 bottom-0 h-[20rem] w-[12rem] shadow-high">
              <div className="relative h-[42%]">{cover.src ? <PhotoTile src={cover.src} alt="" className="absolute inset-0 size-full" /> : null}</div>
              <div className="p-4"><p className="text-base font-semibold leading-5">{cover.name}</p><p className="mt-1.5 flex items-center gap-1.5 text-xs">4.8 <Stars className="size-3" /></p><p className="mt-1.5 text-xs text-text-secondary">{cover.place}</p></div>
            </Phone>
          ) : null}
        </div>
      </div>
    </section>
  );
}

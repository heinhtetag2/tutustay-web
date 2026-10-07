import { createT } from "@/i18n/translate";
import type { Locale } from "@/i18n/config";
import { LocalLink } from "./LocalLink";

/** Same link set as the live footer, grouped so it can be scanned. */
export function Footer({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const groups = [
    { title: t("footer.about"), links: [["/about", t("about.title")], ["/destinations", t("destinations.title")], ["/account/promo-codes?tab=all", t("footer.dealsCoupons")], ["/guide", t("footer.guide")]] },
    { title: t("footer.support"), links: [["/help", t("footer.helpCentre")], ["/help/faq", t("footer.faq")], ["/help/contact", t("footer.contact")], ["/help/inquiry", t("footer.qa")]] },
    { title: t("footer.business"), links: [["/partners", t("partners.title")], ["/partners/apply", t("partners.apply")]] },
    { title: t("footer.legal"), links: [["/legal/terms", t("legal.termsFull")], ["/legal/privacy", t("legal.privacyFull")], ["/legal/cookies", t("legal.cookiesFull")], ["/legal/location", t("legal.locationFull")]] },
  ] as const;
  return (
    <footer className="mt-12 bg-surface-subtle">
      <div className="site-width mx-auto max-w-[var(--container-content)] px-[var(--gutter)] py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16">
          <div className="flex flex-col items-start gap-8">
            <LocalLink href="/" aria-label="TuTuStay home" className="inline-flex h-12 items-center">
              <span
                role="img" aria-label="TuTuStay" className="block h-12 w-16 bg-brand"
                style={{ WebkitMaskImage: "url(/logo.png)", maskImage: "url(/logo.png)", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "left center", maskPosition: "left center", WebkitMaskSize: "contain", maskSize: "contain" }}
              />
            </LocalLink>
            <LocalLink href="/download" className="type-label inline-flex min-h-12 items-center rounded-full border border-border-subtle bg-surface-raised px-6 hover:bg-surface-subtle">
              {t("footer.getApp")}
              <span aria-hidden className="ml-3 flex items-center gap-2">
                {/* App Store: a rounded tile with the "A" made of three strokes. */}
                <svg viewBox="0 0 24 24" className="size-5">
                  <rect x="1" y="1" width="22" height="22" rx="5.500" fill="currentColor" />
                  <g fill="none" stroke="#fff" strokeWidth="1.800" strokeLinecap="round">
                    <path d="m12 5.500-5 9.500" /><path d="m12 5.500 5 9.500" /><path d="M8.600 12.800h8M6.200 17.500h4M14 17.500h3.800" />
                  </g>
                </svg>
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.490 1.490 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.600l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.450.195a1.466 1.466 0 0 0-.946-.179l11.040 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.540-3.230-3.210z" /></svg>
              </span>
            </LocalLink>
          </div>
          <nav aria-label={t("nav.footer")} className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
            {groups.map((g) => (
              <div key={g.title}>
                <h2 className="mb-3 text-base font-semibold leading-6">{g.title}</h2>
                <ul className="flex flex-col">
                  {g.links.map(([href, label]) => <li key={href}><LocalLink href={href} className="inline-flex min-h-10 items-center text-sm leading-5 text-text-primary hover:underline">{label}</LocalLink></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="type-body-sm mt-10 text-text-secondary">{t("footer.note")}</p>
      </div>
    </footer>
  );
}

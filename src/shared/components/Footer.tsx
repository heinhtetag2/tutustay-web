import { createT } from "@/i18n/translate";
import type { Locale } from "@/i18n/config";
import { StoreIcons } from "@/shared/ui/StoreIcons";
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
              <span className="ml-3"><StoreIcons /></span>
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

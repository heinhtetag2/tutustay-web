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
    { title: t("footer.business"), links: [["/partners", t("partners.apply")]] },
  ] as const;
  const legal = [["/legal/terms", t("legal.termsFull")], ["/legal/privacy", t("legal.privacyFull")], ["/legal/cookies", t("legal.cookiesFull")], ["/legal/location", t("legal.locationFull")]] as const;
  return (
    <footer className="mt-8 border-t md:mt-16 border-border-subtle bg-surface-subtle">
      <div className="site-width mx-auto max-w-[var(--container-content)] px-[var(--gutter)] pb-6 pt-10 md:pt-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          <div className="flex flex-col items-start gap-8">
            <LocalLink href="/" aria-label={t("nav.home")} className="inline-flex h-12 items-center">
              <span
                role="img" aria-label="TuTuStay" className="block h-12 w-16 bg-brand"
                style={{ WebkitMaskImage: "url(/logo.png)", maskImage: "url(/logo.png)", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "left center", maskPosition: "left center", WebkitMaskSize: "contain", maskSize: "contain" }}
              />
            </LocalLink>
            <LocalLink href="/download" className="type-label inline-flex min-h-12 items-center rounded-full border border-border-control bg-surface-raised px-6 transition-colors hover:border-text-primary">
              {t("footer.getApp")}
              <span className="ml-3"><StoreIcons /></span>
            </LocalLink>
          </div>
          <nav aria-label={t("nav.footer")} className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3">
            {groups.map((g) => (
              <div key={g.title}>
                <h2 className="type-subheading mb-3">{g.title}</h2>
                <ul className="flex flex-col">
                  {g.links.map(([href, label]) => <li key={href}><LocalLink href={href} className="type-body-sm inline-flex min-h-10 items-center text-text-secondary transition-colors hover:text-text-primary hover:underline">{label}</LocalLink></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border-subtle pt-6 md:flex-row md:items-center md:justify-between">
          <p className="type-body-sm text-text-secondary">© {new Date().getFullYear()} TuTuStay</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legal.map(([href, label]) => <li key={href}><LocalLink href={href} className="type-body-sm inline-flex min-h-8 items-center text-text-secondary transition-colors hover:text-text-primary hover:underline">{label}</LocalLink></li>)}
          </ul>
        </div>
      </div>
    </footer>
  );
}

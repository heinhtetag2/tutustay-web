import { createT } from "@/i18n/translate";
import type { Locale } from "@/i18n/config";
import { LocalLink } from "./LocalLink";

/** Same link set as the live footer, grouped so it can be scanned. */
export function Footer({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const groups = [
    { title: t("footer.explore"), links: [["/destinations", t("destinations.title")], ["/deals", t("footer.dealsCoupons")], ["/download", t("download.title")], ["/about", t("about.title")]] },
    { title: t("footer.support"), links: [["/help", t("footer.helpCentre")], ["/help/faq", t("footer.faq")], ["/guide", t("footer.guide")], ["/help/contact", t("footer.contact")], ["/help/inquiry", t("footer.qa")]] },
    { title: t("footer.account"), links: [["/account/bookings", t("nav.myBookings")], ["/account/favorites", t("fav.title")], ["/account/reviews", t("account.reviews")], ["/account", t("account.title")]] },
    { title: t("footer.partners"), links: [["/partners", t("partners.title")], ["/partners/apply", t("partners.apply")]] },
    { title: t("footer.legal"), links: [["/legal/terms", t("legal.termsFull")], ["/legal/privacy", t("legal.privacyFull")], ["/legal/cookies", t("legal.cookiesFull")], ["/legal/location", t("legal.locationFull")]] },
  ] as const;
  return (
    <footer className="mt-12 bg-surface-subtle">
      <div className="site-width mx-auto max-w-[var(--container-wide)] px-[var(--gutter)] py-10">
        <nav aria-label={t("nav.footer")} className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="type-label mb-3">{g.title}</h2>
              <ul className="flex flex-col gap-1">
                {g.links.map(([href, label]) => <li key={href}><LocalLink href={href} className="type-body-sm inline-flex min-h-11 items-center text-text-secondary hover:text-text-primary">{label}</LocalLink></li>)}
              </ul>
            </div>
          ))}
        </nav>
        <p className="type-body-sm mt-8 text-text-secondary">{t("footer.note")}</p>
      </div>
    </footer>
  );
}

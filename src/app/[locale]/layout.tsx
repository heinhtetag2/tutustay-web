import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_KR, Noto_Sans_Myanmar } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOCALES, isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { Footer } from "@/shared/components/Footer";
import { AuthDialog } from "@/features/auth/AuthDialog";
import { ActiveBookingBar } from "@/features/bookings/ActiveBookingBar";
import { FeedbackDialog } from "@/features/feedback/FeedbackDialog";
import { Header } from "@/shared/components/Header";
import "@/styles/globals.css";

// DM Sans for Latin: the closest free match to Roobert, the font Fresha uses. The CSS variable keeps the old --font-figtree name. Burmese and Korean are loaded explicitly, not left to system fallbacks.
const figtree = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-figtree", display: "swap" });
const myanmar = Noto_Sans_Myanmar({ subsets: ["myanmar"], weight: ["400", "500", "700"], variable: "--font-myanmar", display: "swap", preload: false });
const korean = Noto_Sans_KR({ weight: ["400", "500", "700"], variable: "--font-korean", display: "swap", preload: false });

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = createT(locale);
  return { title: { default: t("meta.title"), template: `%s · TuTuStay` }, description: t("meta.description") };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  return (
    <html lang={locale} className={`${figtree.variable} ${myanmar.variable} ${korean.variable}`}>
      <body className="flex min-h-screen flex-col">
        <I18nProvider locale={locale}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface-raised focus:px-4 focus:py-2">{t("nav.skip")}</a>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer locale={locale} />
          <AuthDialog />
          <ActiveBookingBar />
          <FeedbackDialog />
        </I18nProvider>
      </body>
    </html>
  );
}

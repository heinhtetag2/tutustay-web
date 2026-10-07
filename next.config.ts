import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/", destination: "/en", permanent: false },
      // Legacy URLs from dev.tutustay.com (docs/02 sitemap). Pages that were consolidated redirect to their new home.
      { source: "/hotel/:id", destination: "/en/stays/:id", permanent: false },
      { source: "/hotel/:id/reserve", destination: "/en/stays/:id", permanent: false },
      { source: "/landing", destination: "/en/about", permanent: false },
      { source: "/partners/become-a-partner", destination: "/en/partners/apply", permanent: false },
      { source: "/:locale(en|my|ko)/dev/feedback", destination: "/:locale/feedback", permanent: false },
      // The public Deals page is gone: deals and coupons live in the account.
      { source: "/:locale(en|my|ko)/deals", destination: "/:locale/account/promo-codes?tab=all", permanent: false },
      { source: "/deals", destination: "/en/account/promo-codes?tab=all", permanent: false },
      { source: "/:page(about|help|destinations|search|login|account|partners|download|guide|legal)/:rest*", destination: "/en/:page/:rest*", permanent: false },
    ];
  },
};

export default nextConfig;

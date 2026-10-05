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
      { source: "/:page(about|help|deals|destinations|search|login|account|partners|download|guide|legal)/:rest*", destination: "/en/:page/:rest*", permanent: false },
    ];
  },
};

export default nextConfig;

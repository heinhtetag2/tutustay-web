import type { ReactNode } from "react";

const wrap = (d: ReactNode) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const ICONS: Record<string, ReactNode> = {
  WiFi: wrap(<><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19.2" r="1" fill="currentColor" /></>),
  AC: wrap(<><path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" /><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2" /></>),
  Fan: wrap(<><circle cx="12" cy="12" r="1.5" /><path d="M12 10.5C12 6 14 3.5 16.5 4.5 18 5.2 17 8 12 10.5ZM13.3 12.7c4 2.2 5.2 5.2 3.4 6.8-1.2 1-3.6-.8-3.4-6.8ZM10.7 12.7C6.7 14.9 3.5 14.3 3.3 11.9c-.1-1.600 2.800-2.400 7.400.8Z" /></>),
  "24 Hour Front Desk": wrap(<><path d="M4 18h16M6 18a6 6 0 0 1 12 0M12 8V6M10 6h4" /><path d="M3 21h18" /></>),
  "Airport Shuttle": wrap(<><rect x="3" y="5" width="18" height="12" rx="2.5" /><path d="M3 11h18M7.5 17v2M16.5 17v2M7 14.2h.01M17 14.2h.01" /></>),
  Cafe: wrap(<><path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" /><path d="M16 10.5h1.500a2 2 0 0 1 0 4H16M8 3.500c0 1 1 1 1 2M12 3.500c0 1 1 1 1 2" /></>),
  "Swimming Pool": wrap(<><path d="M3 18c1.500 1.200 3 1.200 4.500 0s3-1.200 4.500 0 3 1.200 4.500 0 3-1.200 4.500 0M3 14c1.500 1.200 3 1.200 4.500 0s3-1.200 4.500 0 3 1.200 4.500 0 3-1.200 4.500 0" /><path d="M8 11V5.500A1.500 1.500 0 0 1 9.500 4M15 11V5.500A1.500 1.500 0 0 1 16.500 4M8 8h7" /></>),
  "Campfire Area": wrap(<><path d="M12 3c.5 3-3 4.500-3 8a3 3 0 0 0 6 0c0-1.500-.8-2.300-1.500-3.200C13 9 13 6 12 3Z" /><path d="M5 21l14-3M5 18l14 3" /></>),
  "Spa & Wellness Centre": wrap(<><path d="M12 20c-4 0-7-2.500-7-6 4 0 6 1.500 7 3.500C13 15.500 15 14 19 14c0 3.500-3 6-7 6Z" /><path d="M12 14c-2.500-1-3.500-3.500-3-6.500 2.500.5 4 2.500 4 5M12 14c2.500-1 3.500-3.500 3-6.500" /></>),
};
const FALLBACK = wrap(<path d="m5 12.500 4.500 4.500L19 7.500" />);

export const amenityIcon = (name: string): ReactNode => ICONS[name] ?? FALLBACK;

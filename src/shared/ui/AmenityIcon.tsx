import type { ReactNode } from "react";

// Amenity names come from the API as free text, so match on keywords and fall back to a check mark.
const ICONS: Array<[RegExp, ReactNode]> = [
  [/wi-?fi|internet/i, <><path d="M2.5 9a14 14 0 0 1 19 0" /><path d="M5.5 12.5a9.5 9.5 0 0 1 13 0" /><path d="M8.7 16a5 5 0 0 1 6.6 0" /><circle cx="12" cy="19.2" r=".6" /></>],
  [/\bac\b|air.?con/i, <><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /><path d="m9.5 4.5 2.5 1.8 2.5-1.8M9.5 19.5l2.5-1.8 2.5 1.8" /></>],
  [/kettle|coffee|tea/i, <><path d="M6 9h10v7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z" /><path d="M16 11h1.5a2 2 0 0 1 0 4H16M9 3.5c0 1 1 1 1 2M12.5 3.5c0 1 1 1 1 2" /></>],
  [/fan/i, <><circle cx="12" cy="12" r="1.6" /><path d="M12 10.4C12 6 10 3.5 7.5 4.5c-2 .9-1 4.2 2.4 5.2M13.6 12c4.4 0 6.9-2 5.9-4.5-.9-2-4.2-1-5.2 2.400M12 13.6c0 4.4 2 6.9 4.5 5.9 2-.9 1-4.2-2.4-5.200M10.4 12C6 12 3.5 14 4.5 16.500c.9 2 4.2 1 5.2-2.4" /></>],
  [/housekeep|clean|laundry/i, <><path d="M12 3v3M5 21V12a7 7 0 0 1 14 0v9Z" /><path d="M9 21v-5h6v5" /></>],
  [/tv|television/i, <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></>],
  [/break.?fast|meal|food/i, <><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 21V3c-2 1-3 4-3 7 0 2 1 3 3 3" /></>],
  [/park/i, <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3" /></>],
  [/pool|swim/i, <><path d="M3 18c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1M8 15V6a2 2 0 0 1 4 0M14 15V6a2 2 0 0 1 4 0M8 9h6" /></>],
  [/hot water|shower|bath|toilet/i, <><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5ZM6 12V6a2 2 0 0 1 3.5-1.300M7 19l-1 2M17 19l1 2" /></>],
  [/fridge|refrigerator|mini.?bar/i, <><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M6 10h12M9 6v1.500M9 13v3" /></>],
];
const FALLBACK = <path d="m5 12.5 4.5 4.500L19 7.5" />;

export function AmenityIcon({ name, className = "size-4" }: { name: string; className?: string }) {
  const icon = ICONS.find(([re]) => re.test(name))?.[1] ?? FALLBACK;
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
  );
}

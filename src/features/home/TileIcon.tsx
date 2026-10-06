const PATHS = {
  reviews: <path d="m12 3 2.700 5.600 6.100.8-4.500 4.200 1.100 6-5.400-3-5.400 3 1.100-6L3.200 9.400l6.100-.8Z" />,
  payment: <><rect x="3" y="5.500" width="18" height="13" rx="2.500" /><path d="M3 10h18M7 15h3" /></>,
  price: <><path d="M3 12V4.500A1.500 1.500 0 0 1 4.500 3H12l9 9-8 8Z" /><circle cx="8" cy="8" r="1.200" /></>,
  claim: <><path d="M3 9a2 2 0 0 0 0 6v2.500A1.500 1.500 0 0 0 4.500 19h15a1.500 1.500 0 0 0 1.500-1.500V15a2 2 0 0 1 0-6V6.500A1.500 1.500 0 0 0 19.500 5h-15A1.500 1.500 0 0 0 3 6.500Z" /><path d="M14 5v2.500M14 11v2M14 16.500V19" /></>,
  mine: <><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /><path d="m9 10 2 2 4-4" /></>,
  app: <><rect x="7" y="2.500" width="10" height="19" rx="2.500" /><path d="M11 18.500h2" /></>,
  lowest: <><path d="M4 7l6 6 4-4 6 6" /><path d="M20 10v5h-5" /></>,
  browse: <><circle cx="11" cy="11" r="6.500" /><path d="m20 20-4.200-4.200" /></>,
} as const;

export type TileIconName = keyof typeof PATHS;

/** A round brand-tinted icon badge for the home tiles. Decorative: the tile's title says what it is. */
export function TileIcon({ name }: { name: TileIconName }) {
  return (
    <span aria-hidden className="mb-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand">
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{PATHS[name]}</svg>
    </span>
  );
}

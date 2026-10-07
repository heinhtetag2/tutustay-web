import type { PropertyCategory } from "@/domain";

const PATHS = {
  all: <><rect x="4" y="4" width="6.500" height="6.500" rx="1.500" /><rect x="13.500" y="4" width="6.500" height="6.500" rx="1.500" /><rect x="4" y="13.500" width="6.500" height="6.500" rx="1.500" /><rect x="13.500" y="13.500" width="6.500" height="6.500" rx="1.500" /></>,
  hotel: <><path d="M5 21V4.500A1.500 1.500 0 0 1 6.500 3h11A1.500 1.500 0 0 1 19 4.500V21M3 21h18" /><path d="M9 7.500h1.500M13.500 7.500H15M9 11.500h1.500M13.500 11.500H15M10.500 21v-4h3v4" /></>,
  motel: <><path d="M3 11.500 12 4l9 7.500" /><path d="M5.500 10v10.500h13V10" /><path d="M10 20.500v-5h4v5" /></>,
  resort: <><path d="M12 21V9" /><path d="M12 9c-1-3.500-4-4.500-7-4 2 .5 3.500 1.800 4.500 4M12 9c1-3.500 4-4.500 7-4-2 .5-3.500 1.800-4.500 4" /><path d="M3 21c2-1.500 4-1.500 6 0s4 1.500 6 0 4-1.500 6 0" /></>,
  campsite: <><path d="M3 20.500 12 4l9 16.500Z" /><path d="M12 20.500v-6M9.500 20.500 12 14.500l2.500 6" /></>,
} as const;

/** Line icon for a property type (or "all"). Decorative: the label next to it says what it is. */
export function CategoryIcon({ name, className = "size-5" }: { name: PropertyCategory | "all"; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{PATHS[name]}</svg>
  );
}

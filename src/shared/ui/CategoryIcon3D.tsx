import type { PropertyCategory } from "@/domain";

/** Gradient stops per face: lit, front and shaded sides give the flat shapes a small 3D look. */
const g = (id: string, a: string, b: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
);

const ART: Record<PropertyCategory, React.ReactNode> = {
  hotel: (
    <>
      <defs>{g("h-front", "#6EA4FF", "#2F6FE0")}{g("h-side", "#2F63C9", "#1B418F")}{g("h-top", "#D2E3FF", "#9DBFFF")}</defs>
      <ellipse cx="32" cy="57" rx="22" ry="4" fill="#0000001f" />
      <polygon points="36,20 50,14 50,48 36,54" fill="url(#h-side)" />
      <polygon points="14,20 28,14 50,14 36,20" fill="url(#h-top)" />
      <polygon points="14,20 36,20 36,54 14,54" fill="url(#h-front)" />
      {[26, 33, 40].flatMap((y) => [19, 27].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="4" rx="1" fill="#ffffffd9" />))}
      <rect x="22" y="46" width="7" height="8" rx="1" fill="#FFD27A" />
      {[24, 32, 40].map((y) => <polygon key={y} points={`39,${y + 1} 47,${y - 2} 47,${y + 2} 39,${y + 5}`} fill="#ffffff66" />)}
    </>
  ),
  motel: (
    <>
      <defs>{g("m-wall", "#FFC987", "#F0983F")}{g("m-side", "#D98A3A", "#B2651C")}{g("m-roof", "#F2695D", "#D2443A")}{g("m-roof2", "#B93A31", "#8F2A24")}</defs>
      <ellipse cx="32" cy="57" rx="23" ry="4" fill="#0000001f" />
      <polygon points="36,34 52,28 52,48 36,54" fill="url(#m-side)" />
      <polygon points="12,34 36,34 36,54 12,54" fill="url(#m-wall)" />
      <polygon points="24,17 36,13 56,29 40,35" fill="url(#m-roof2)" />
      <polygon points="8,35 24,17 40,35" fill="url(#m-roof)" />
      <rect x="20" y="42" width="8" height="12" rx="1.500" fill="#7A4A22" />
      <rect x="30" y="40" width="4" height="5" rx="1" fill="#ffffffd9" />
      <rect x="14" y="40" width="4" height="5" rx="1" fill="#ffffffd9" />
    </>
  ),
  resort: (
    <>
      <defs>{g("r-water", "#7DE0F5", "#2AA8D8")}{g("r-sand", "#FFE6A3", "#F0C46B")}{g("r-leaf", "#5FD37A", "#1E9B53")}</defs>
      <ellipse cx="32" cy="54" rx="26" ry="7" fill="url(#r-water)" />
      <ellipse cx="32" cy="50" rx="17" ry="6" fill="url(#r-sand)" />
      <circle cx="49" cy="17" r="7" fill="#FFB84D" />
      <path d="M31 49c1-9 1-17-2-26l4-1c3 9 3 18 1 27Z" fill="#8A5A2B" />
      <path d="M31 23c-6-9-15-8-20-3 7-1 12 0 17 5Z" fill="url(#r-leaf)" />
      <path d="M32 23c6-9 15-8 20-3-7-1-12 0-17 5Z" fill="url(#r-leaf)" />
      <path d="M31 22c-2-8-8-12-15-10 6 1 10 4 13 11Z" fill="#37B866" />
      <path d="M33 22c2-8 8-12 15-10-6 1-10 4-13 11Z" fill="#37B866" />
      <circle cx="31.500" cy="25" r="2.500" fill="#6B4220" />
    </>
  ),
  campsite: (
    <>
      <defs>{g("c-front", "#5BD99B", "#1F9D63")}{g("c-side", "#1F9D63", "#157348")}{g("c-ground", "#B5E27A", "#86C24A")}</defs>
      <ellipse cx="32" cy="54" rx="26" ry="6" fill="url(#c-ground)" />
      <polygon points="32,14 56,52 40,52 32,38" fill="url(#c-side)" />
      <polygon points="32,14 8,52 40,52 32,38" fill="url(#c-front)" />
      <polygon points="32,28 24,52 40,52" fill="#115C3A" />
      <polygon points="32,28 28,40 36,40" fill="#FFB84D" />
      <rect x="31" y="9" width="2" height="7" rx="1" fill="#8A5A2B" />
    </>
  ),
};

/** Small 3D-style illustration for a property type, used on the home page tiles. Decorative: the label next to it says what it is. */
export function CategoryIcon3D({ name, className = "size-14" }: { name: PropertyCategory; className?: string }) {
  return <svg aria-hidden viewBox="0 0 64 64" className={className}>{ART[name]}</svg>;
}

import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { TileIcon, type TileIconName } from "./TileIcon";

/** Trust claims. Payment is per stay, so this states the real rule instead of one global claim (resolves CT-1). */
export function TrustPoints({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const points: { icon: TileIconName; title: string; body: string }[] = [
    { icon: "reviews", title: t("trust.reviews.title"), body: t("trust.reviews.body") },
    { icon: "payment", title: t("trust.pay.title"), body: t("trust.pay.body") },
    { icon: "price", title: t("trust.price.title"), body: t("trust.price.body") },
  ];
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {points.map((p) => (
        <li key={p.title} className="rounded-card border border-border-subtle bg-surface-raised p-5">
          <TileIcon name={p.icon} />
          <h3 className="type-subheading">{p.title}</h3>
          <p className="type-body-sm mt-1 text-text-secondary">{p.body}</p>
        </li>
      ))}
    </ul>
  );
}

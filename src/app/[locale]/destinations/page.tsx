import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { STAYS } from "@/services/mocks/fixtures";
import { LocalLink } from "@/shared/components/LocalLink";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";

export const metadata = { title: "Destinations" };

/** Region > city > township hierarchy (proposal; real hierarchy depends on Q6). */
export default async function DestinationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = createT(locale);
  const tree = new Map<string, Map<string, Map<string, number>>>();
  for (const s of STAYS) {
    const r = tree.get(s.place.region) ?? new Map();
    const c = r.get(s.place.city) ?? new Map();
    c.set(s.place.township ?? "—", (c.get(s.place.township ?? "—") ?? 0) + 1);
    r.set(s.place.city, c);
    tree.set(s.place.region, r);
  }
  const count = (n: number) => t(n === 1 ? "search.countOne" : "search.count", { n });
  return (
    <Container className="py-8">
      <PageHeader title={t("destinations.title")} description={t("destinations.intro")} />
      <div className="grid gap-6 md:grid-cols-2">
        {[...tree].map(([region, cities]) => (
          <section key={region} className="rounded-card border border-border-subtle bg-surface-raised p-5">
            <h2 className="type-heading mb-3">{region}</h2>
            <ul className="flex flex-col gap-3">
              {[...cities].map(([city, townships]) => (
                <li key={city}>
                  <LocalLink href={`/search?place=${encodeURIComponent(city)}`} className="type-subheading text-text-link">{city}</LocalLink>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {[...townships].filter(([n]) => n !== "—").map(([n, k]) => (
                      <li key={n}><LocalLink href={`/search?place=${encodeURIComponent(n)}`} className="type-body-sm rounded-control bg-surface-subtle px-2 py-1">{n} · {count(k)}</LocalLink></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}

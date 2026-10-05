"use client";

import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Checkbox, Field, Input, Select } from "@/shared/ui/Field";
import { Price } from "@/shared/ui/Price";
import { Skeleton } from "@/shared/ui/Skeleton";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { EmptyState, ErrorState } from "@/shared/ui/States";
import { Container, Section } from "@/shared/layout/Container";

const roles = ["display", "title", "heading", "subheading", "body", "body-sm", "label", "caption"] as const;
const swatches = [
  ["surface-page", "bg-surface-page"], ["surface-raised", "bg-surface-raised"], ["surface-subtle", "bg-surface-subtle"],
  ["surface-brand-subtle", "bg-surface-brand-subtle"], ["brand", "bg-brand"], ["action-primary", "bg-action-primary"],
  ["success-bg", "bg-success-bg"], ["warning-bg", "bg-warning-bg"], ["error-bg", "bg-error-bg"], ["info-bg", "bg-info-bg"], ["promo-bg", "bg-promo-bg"],
] as const;

/** Internal reference page for tokens, type roles and every UI state. Not a product page. */
export function KitchenSinkView() {
  const h2 = "type-heading mb-4";
  return (
    <Container className="py-8">
      <h1 className="type-title">Kitchen sink</h1>
      <p className="type-body mt-2 text-text-secondary">Tokens, type roles and UI states. Internal reference.</p>

      <Section><h2 className={h2}>Semantic colour</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">{swatches.map(([n, c]) => <li key={n} className="rounded-field border border-border-subtle p-2"><div className={`h-12 rounded-control border border-border-subtle ${c}`} /><p className="type-caption mt-1">{n}</p></li>)}</ul>
      </Section>

      <Section><h2 className={h2}>Type roles</h2>
        <div className="flex flex-col gap-3">{roles.map((r) => <p key={r} className={`type-${r}`}>type-{r} · Find your stay across Myanmar · မြန်မာနိုင်ငံတစ်ဝန်း · 미얀마 숙소</p>)}
          <p className="flex gap-6"><Price amount={40000} unit="/ night" size="lg" /><Price amount={40000} unit="/ night" size="md" /><Price amount={40000} unit="/ night" size="sm" /></p></div>
      </Section>

      <Section><h2 className={h2}>Buttons</h2>
        <div className="flex flex-wrap gap-3"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button disabled>Disabled</Button><Button loading>Loading</Button><Button size="lg">Large</Button></div>
      </Section>

      <Section><h2 className={h2}>Fields</h2>
        <div className="grid max-w-xl gap-4">
          <Field label="Default" hint="Helper text">{({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} />}</Field>
          <Field label="Error" error="This field has a problem" required>{({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} invalid={invalid} defaultValue="bad value" />}</Field>
          <Field label="Disabled">{({ id }) => <Input id={id} disabled defaultValue="Disabled" />}</Field>
          <Field label="Select">{({ id }) => <Select id={id}><option>One</option><option>Two</option></Select>}</Field>
          <Checkbox label="Checkbox with label" />
        </div>
      </Section>

      <Section><h2 className={h2}>Badges and banners</h2>
        <div className="mb-4 flex flex-wrap gap-2"><Badge>Neutral</Badge><Badge tone="success">Success</Badge><Badge tone="warning">Warning</Badge><Badge tone="error">Error</Badge><Badge tone="info">Info</Badge><Badge tone="promo">Promo</Badge></div>
        <div className="flex max-w-xl flex-col gap-3"><StatusBanner tone="info" title="Info">Plain explanation.</StatusBanner><StatusBanner tone="success" title="Success">Done.</StatusBanner><StatusBanner tone="warning" title="Warning">Check this.</StatusBanner><StatusBanner tone="error" title="Error">It failed.</StatusBanner></div>
      </Section>

      <Section><h2 className={h2}>States</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState title="Empty" body="Why it is empty and the next step." action={<Button variant="secondary">Next step</Button>} />
          <ErrorState title="Error" body="What failed and how to continue." action={<Button>Retry</Button>} />
          <div className="flex flex-col gap-2"><p className="type-label">Loading</p><Skeleton className="h-8 w-full" /><Skeleton className="h-24 w-full" /></div>
        </div>
      </Section>
    </Container>
  );
}

import type { ReactNode } from "react";
import { BackLink } from "../components/BackLink";
import { Breadcrumbs } from "../components/Breadcrumbs";

/** One h1 per page. 24px below the title, per the layout rules. */
export function PageHeader({ title, description, actions, back = "/", crumbs, crumbLabel, future }: { title: string; description?: string; actions?: ReactNode; /** Parent pages as a breadcrumb trail (replaces the Back button); the last crumb is `crumbLabel` or the title. */ crumbs?: { href: string; label: string }[]; crumbLabel?: string; /** Steps still ahead, shown in grey after the current page. */ future?: string[]; /** Parent page to fall back to. `false` hides the link (pages that have their own navigation). */ back?: string | false }) {
  return (
    <header className="mb-6">
      {crumbs ? <Breadcrumbs crumbs={crumbs} current={crumbLabel ?? title} future={future} /> : back === false ? null : <BackLink fallback={back} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="type-title">{title}</h1>
        {description ? <p className="type-body text-text-secondary mt-2 max-w-2xl">{description}</p> : null}
      </div>
      {actions}
      </div>
    </header>
  );
}

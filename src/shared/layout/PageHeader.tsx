import type { ReactNode } from "react";
import { BackLink } from "../components/BackLink";

/** One h1 per page. 24px below the title, per the layout rules. */
export function PageHeader({ title, description, actions, back = "/" }: { title: string; description?: string; actions?: ReactNode; /** Parent page to fall back to. `false` hides the link (pages that have their own navigation). */ back?: string | false }) {
  return (
    <header className="mb-6">
      {back === false ? null : <BackLink fallback={back} />}
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

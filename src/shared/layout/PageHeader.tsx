import type { ReactNode } from "react";

/** One h1 per page. 24px below the title, per the layout rules. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="type-title">{title}</h1>
        {description ? <p className="type-body text-text-secondary mt-2 max-w-2xl">{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}

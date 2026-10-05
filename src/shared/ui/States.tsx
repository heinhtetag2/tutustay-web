import type { ReactNode } from "react";

/** Empty: say WHY it's empty and offer ONE clear next action. */
export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border-control bg-surface-raised px-6 py-12 text-center">
      <h2 className="type-subheading">{title}</h2>
      {body ? <p className="type-body text-text-secondary max-w-md">{body}</p> : null}
      {action}
    </div>
  );
}

/** Error: plain words, what failed, and a way forward. Never lose user input. */
export function ErrorState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-card bg-error-bg px-6 py-12 text-center">
      <h2 className="type-subheading text-error-text">{title}</h2>
      {body ? <p className="type-body text-text-primary max-w-md">{body}</p> : null}
      {action}
    </div>
  );
}

"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export { Select } from "./Select";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (a: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}

/** Label + control + hint + error, wired with ids so errors are announced and associated. */
export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="type-label text-text-primary">
        {label}
        {required ? <span aria-hidden className="text-error-text"> *</span> : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? <p id={hintId} className="type-body-sm text-text-secondary">{hint}</p> : null}
      {error ? <p id={errId} role="alert" className="type-body-sm text-error-text">{error}</p> : null}
    </div>
  );
}

const control =
  "min-h-11 w-full rounded-field border bg-surface-raised px-3 type-body text-text-primary placeholder:text-text-muted disabled:bg-surface-subtle disabled:text-text-disabled";
const ring = (invalid: boolean) => (invalid ? "border-error-text" : "border-border-control");

export function Input({ invalid, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...rest} aria-invalid={invalid || undefined} className={cn(control, ring(Boolean(invalid)), className)} />;
}

export function Textarea({ invalid, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea {...rest} aria-invalid={invalid || undefined} className={cn(control, "py-2", ring(Boolean(invalid)), className)} />;
}

export function Checkbox({
  label, error, className, ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode; error?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id} type="checkbox" {...rest}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className="mt-0.5 size-5 shrink-0 accent-[var(--action-primary)]"
        />
        <label htmlFor={id} className="type-body-sm text-text-primary">{label}</label>
      </div>
      {error ? <p id={`${id}-err`} role="alert" className="type-body-sm mt-1 text-error-text">{error}</p> : null}
    </div>
  );
}

/** Password field with a show/hide toggle (live login has "Show password"). The toggle is a real button with aria-pressed. */
export function PasswordInput({ invalid, className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input {...rest} type={shown ? "text" : "password"} invalid={invalid} className={cn("pr-24", className)} />
      <button
        type="button" aria-pressed={shown} aria-label={shown ? "Hide password" : "Show password"} onClick={() => setShown((s) => !s)}
        className="type-label absolute inset-y-0 right-1 my-auto h-9 rounded-control px-3 text-text-link hover:bg-surface-subtle"
      >
        <span aria-hidden>{shown ? "Hide" : "Show"}</span>
      </button>
    </div>
  );
}

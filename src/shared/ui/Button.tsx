"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LocalLink } from "../components/LocalLink";
import { cn } from "../lib/cn";

type Variant = "primary" | "cta" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 type-label font-medium transition-[background-color,color,transform,box-shadow] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-disabled disabled:border-transparent";
const variants: Record<Variant, string> = {
  primary: "bg-action-primary text-text-on-action hover:bg-action-primary-hover active:bg-action-primary-pressed",
  /** The booking call to action: brand blue (Reserve, Choose room). */
  cta: "bg-action-cta text-text-on-action hover:bg-action-cta-hover active:bg-action-cta-hover",
  secondary: "border border-text-primary bg-surface-raised text-text-primary hover:bg-surface-subtle",
  ghost: "text-text-link hover:bg-surface-brand-subtle",
};
const sizes: Record<Size, string> = { md: "min-h-11 rounded-control px-4", lg: "min-h-12 rounded-full px-6 text-[16px]" };

interface Common { variant?: Variant; size?: Size; fullWidth?: boolean; className?: string; children: ReactNode }

export function Button({
  variant = "primary", size = "md", fullWidth, loading, className, children, disabled, ...rest
}: Common & { loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
    >
      {loading ? <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}

export function LinkButton({
  href, variant = "primary", size = "md", fullWidth, className, children, onClick,
}: Common & { href: string; onClick?: () => void }) {
  return (
    <LocalLink href={href} onClick={onClick} className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}>
      {children}
    </LocalLink>
  );
}

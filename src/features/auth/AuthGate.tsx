"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { useT } from "@/i18n/I18nProvider";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useMockSession } from "@/shared/hooks/useMockSession";
import { openAuthDialog } from "@/shared/hooks/useAuthDialog";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";

/**
 * Sign-in is required only at the commit step. The full return path (with the whole search
 * and room selection in the query) travels in `next`, so nothing is lost across sign-in.
 */
function Gate({ children, reason }: { children: ReactNode; reason: "book" | "account" }) {
  const t = useT();
  const hydrated = useHydrated();
  const session = useMockSession();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  if (!hydrated) return <Skeleton className="h-64 w-full" />;
  if (session) return <>{children}</>;

  const next = encodeURIComponent(`${pathname}${search ? `?${search}` : ""}`);
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-card border border-border-subtle bg-surface-raised p-6">
      <h2 className="type-heading">{t(reason === "book" ? "auth.gate.bookTitle" : "auth.gate.accountTitle")}</h2>
      <p className="type-body text-text-secondary">{t(reason === "book" ? "auth.gate.bookBody" : "auth.gate.accountBody")}</p>
      <Button size="lg" onClick={openAuthDialog}>{t("nav.signIn")}</Button>
    </div>
  );
}

/** useSearchParams needs a Suspense boundary for static rendering. */
export function AuthGate(props: { children: ReactNode; reason: "book" | "account" }) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <Gate {...props} />
    </Suspense>
  );
}

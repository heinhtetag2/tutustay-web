import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CodeFlow } from "@/features/auth/CodeFlow";
import { isLocale } from "@/i18n/config";
import { BackLink } from "@/shared/components/BackLink";
import { AuthBackdrop } from "@/features/auth/AuthBackdrop";

export const metadata = { title: "Reset password" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AuthBackdrop>
      <BackLink fallback="/" />
      <Suspense fallback={null}><CodeFlow kind="reset" /></Suspense>
    </AuthBackdrop>
  );
}

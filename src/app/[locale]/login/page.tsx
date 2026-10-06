import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LoginForm } from "@/features/auth/LoginForm";
import { isLocale } from "@/i18n/config";
import { BackLink } from "@/shared/components/BackLink";
import { AuthBackdrop } from "@/features/auth/AuthBackdrop";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AuthBackdrop>
      <BackLink fallback="/" />
      <Suspense fallback={null}><LoginForm /></Suspense>
    </AuthBackdrop>
  );
}

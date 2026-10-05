import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LoginForm } from "@/features/auth/LoginForm";
import { isLocale } from "@/i18n/config";
import { Container } from "@/shared/layout/Container";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Container size="narrow" className="py-10">
      <Suspense fallback={null}><LoginForm /></Suspense>
    </Container>
  );
}

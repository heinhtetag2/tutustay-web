import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CodeFlow } from "@/features/auth/CodeFlow";
import { isLocale } from "@/i18n/config";
import { Container } from "@/shared/layout/Container";

export const metadata = { title: "Reset password" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Container size="narrow" className="py-10">
      <Suspense fallback={null}><CodeFlow kind="reset" /></Suspense>
    </Container>
  );
}

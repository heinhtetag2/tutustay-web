import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { ProfileOverview } from "@/features/auth/ProfileOverview";
import { isLocale } from "@/i18n/config";

export const metadata = { title: "My profile" };

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AuthGate reason="account"><ProfileOverview /></AuthGate>;
}

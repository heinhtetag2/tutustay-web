import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { SettingsPanel } from "@/features/auth/SettingsPanel";
import { isLocale } from "@/i18n/config";

export const metadata = { title: "Settings" };

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AuthGate reason="account"><SettingsPanel /></AuthGate>;
}

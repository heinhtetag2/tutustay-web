import { notFound } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { NotificationList } from "@/features/auth/NotificationList";
import { isLocale } from "@/i18n/config";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AuthGate reason="account"><NotificationList /></AuthGate>;
}

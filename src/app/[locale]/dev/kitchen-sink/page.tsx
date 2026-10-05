import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { KitchenSinkView } from "./View";

export const metadata = { title: "Kitchen sink (dev)" };

export default async function KitchenSink({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <KitchenSinkView />;
}

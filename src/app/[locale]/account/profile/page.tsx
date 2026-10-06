import { redirect } from "next/navigation";

/** The old product's profile address: the profile overview is the account home. */
export default async function ProfileRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/account`);
}

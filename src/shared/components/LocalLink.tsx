"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/i18n/I18nProvider";

/** next/link that prefixes the active locale. Pass paths WITHOUT the locale: `/search?x=1`. */
export function LocalLink({ href, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const locale = useLocale();
  return <Link href={`/${locale}${href === "/" ? "" : href}`} {...rest} />;
}

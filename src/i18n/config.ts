export const LOCALES = ["en", "my", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABEL: Record<Locale, string> = { en: "English", my: "မြန်မာ", ko: "한국어" };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

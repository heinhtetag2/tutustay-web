"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import { createT, type TFunction } from "./translate";

interface Ctx { locale: Locale; t: TFunction }
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: createT(locale) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT/useLocale must be used inside <I18nProvider>");
  return ctx;
}

export const useT = (): TFunction => useI18n().t;
export const useLocale = (): Locale => useI18n().locale;

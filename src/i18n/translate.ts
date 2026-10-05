import type { Locale } from "./config";
import { en, type MessageKey } from "./messages/en";
import { ko } from "./messages/ko";
import { my } from "./messages/my";

export type { MessageKey };
export type TFunction = (key: MessageKey, params?: Record<string, string | number>) => string;

const catalogs: Record<Locale, Partial<Record<MessageKey, string>>> = { en, my, ko };

/** Missing keys fall back to English, so an untranslated string is never blank. */
export function createT(locale: Locale): TFunction {
  const catalog = catalogs[locale];
  return (key, params) => {
    const template = catalog[key] ?? en[key];
    return params ? template.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`)) : template;
  };
}

import type { LocalizedText } from "@/config/types";
import { defaultSiteConfig } from "@/config/site.config";

/**
 * Resolve a localized string for the active locale, gracefully falling back to
 * the default locale, then to any available value, then to an empty string.
 */
export function t(text: LocalizedText | string | undefined, locale: string): string {
  if (text == null) return "";
  if (typeof text === "string") return text;
  return text[locale] ?? text["ar"] ?? text["en"] ?? Object.values(text)[0] ?? "";
}

/**
 * Format a price using the Intl API with the configured currency.
 * Amounts are stored as integers in the currency's minor units where the
 * fraction digits are defined by config (KWD = 3 → 1000 = 1.000 KD).
 */
export function formatPrice(
  minorAmount: number,
  locale: string,
  opts?: { fractionDigits?: number; symbol?: string },
): string {
  const { commerce } = defaultSiteConfig;
  const fractionDigits = opts?.fractionDigits ?? commerce.currencyFractionDigits;
  const symbol = opts?.symbol ?? commerce.currencySymbol[locale] ?? commerce.currencySymbol.en;
  const value = minorAmount / Math.pow(10, fractionDigits);

  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-KW", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

  // Symbol before number in both locales (matches the reference "KD48").
  return `${symbol}${formatted}`;
}

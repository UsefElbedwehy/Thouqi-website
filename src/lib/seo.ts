import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Build `alternates` (canonical + hreflang) for a localized path.
 * `path` is the locale-agnostic path (e.g. "/c/shirts"); this generates the
 * per-locale URLs plus an `x-default` pointing at the default locale.
 */
export function localizedAlternates(path: string, locale: string): Metadata["alternates"] {
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${SITE_URL}/${l}${clean}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${clean}`;
  return {
    canonical: `${SITE_URL}/${locale}${clean}`,
    languages,
  };
}

export { SITE_URL };

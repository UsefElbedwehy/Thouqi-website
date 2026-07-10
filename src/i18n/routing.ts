import { defineRouting } from "next-intl/routing";

/**
 * Locale routing configuration.
 *
 * Adding a new language requires ONLY:
 *   1. Adding its code here + a `messages/<code>.json` catalog.
 *   2. Registering its metadata in `src/config/locales.ts`.
 * No component or architectural changes are needed.
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // Always show the locale prefix (/ar, /en) for clean, SEO-friendly localized URLs + hreflang.
  localePrefix: "always",
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];

/**
 * Locale metadata registry.
 *
 * Adding a language = add an entry here + a `messages/<code>.json` catalog +
 * the code in `src/i18n/routing.ts`. Everything else (direction, fonts, labels)
 * is derived from this table — no component changes required.
 */

export type Direction = "ltr" | "rtl";

export interface LocaleMeta {
  code: string;
  /** Native language name shown in the language switcher. */
  label: string;
  /** English name (for admin tooling / accessibility). */
  englishLabel: string;
  dir: Direction;
  /** CSS variable name selecting the font stack for this locale's body text. */
  fontVar: "--font-arabic" | "--font-latin";
}

export const LOCALES: Record<string, LocaleMeta> = {
  ar: {
    code: "ar",
    label: "عربي",
    englishLabel: "Arabic",
    dir: "rtl",
    fontVar: "--font-arabic",
  },
  en: {
    code: "en",
    label: "English",
    englishLabel: "English",
    dir: "ltr",
    fontVar: "--font-latin",
  },
};

export function getLocaleMeta(code: string): LocaleMeta {
  return LOCALES[code] ?? LOCALES.en;
}

export function getDirection(code: string): Direction {
  return getLocaleMeta(code).dir;
}

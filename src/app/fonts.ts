import { Inter, IBM_Plex_Sans_Arabic, Bodoni_Moda } from "next/font/google";

/**
 * Bilingual typography tuned for a premium fashion identity.
 * - Display: Bodoni Moda — high-contrast editorial serif (Vogue-like) for the
 *   logo and headings.
 * - Latin body: Inter.
 * - Arabic: IBM Plex Sans Arabic.
 * Each exposes a CSS variable consumed by the design tokens in globals.css.
 */
export const fontLatin = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const fontDisplay = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const fontVariables = `${fontLatin.variable} ${fontArabic.variable} ${fontDisplay.variable}`;

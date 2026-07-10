import type { ReactNode } from "react";
import "./globals.css";

/**
 * Root layout. Intentionally minimal: the localized <html>/<body> (with the
 * correct `lang` and `dir`) is rendered by `app/[locale]/layout.tsx`, since the
 * document direction depends on the active locale.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

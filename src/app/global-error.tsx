"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: catches errors thrown by the root layout itself (e.g.
 * a failed remote-config fetch), where even the locale-scoped error.tsx can't
 * render. Must define its own <html>/<body> since it replaces the root layout.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#666", maxWidth: 420 }}>Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          style={{ padding: "10px 24px", background: "#111", color: "#fff", borderRadius: 6, border: "none", cursor: "pointer" }}
        >
          Retry
        </button>
      </body>
    </html>
  );
}

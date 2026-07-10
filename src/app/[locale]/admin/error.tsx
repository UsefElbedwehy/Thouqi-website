"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";

/** Admin error boundary. Chrome is English-only (internal tooling), matching the rest of /admin. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em] text-primary">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred loading this page. You can try again or head back to the dashboard.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground"
        >
          Retry
        </button>
        <Link href="/admin" className="rounded-[--radius] border border-border px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] hover:border-primary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}

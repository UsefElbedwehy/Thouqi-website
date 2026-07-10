"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

/** Storefront-wide error boundary (catches runtime errors in any page under this segment). */
export default function StorefrontError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const te = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-display text-4xl font-bold text-primary">{te("genericTitle")}</h1>
      <p className="max-w-md text-muted-foreground">{te("genericBody")}</p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[--radius] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {te("retry")}
        </button>
        <Link href="/" className="rounded-[--radius] border border-border px-6 py-2.5 text-sm hover:border-primary">
          {te("backHome")}
        </Link>
      </div>
    </Container>
  );
}

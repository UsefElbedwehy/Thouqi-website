"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LOCALES } from "@/config/locales";
import { cn } from "@/lib/utils";

/**
 * Switches locale while preserving the current path. Uses next-intl's
 * locale-aware router so the URL prefix and document direction update without a
 * full reload. The choice persists via the NEXT_LOCALE cookie set by the router.
 */
export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Show the OTHER locale as the toggle target (mirrors the reference "عربي" link).
  const target = routing.locales.find((l) => l !== locale) ?? locale;
  const meta = LOCALES[target];

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          router.replace(pathname, { locale: target });
        })
      }
      className={cn(
        "text-sm underline-offset-4 hover:underline disabled:opacity-50",
        "transition-opacity",
      )}
      aria-label={`Switch language to ${meta.englishLabel}`}
    >
      {meta.label}
    </button>
  );
}

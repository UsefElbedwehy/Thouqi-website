import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Breadcrumb trail. The chevron is flipped for RTL via `rtl:rotate-180` so it
 * always points along the reading direction.
 */
export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const tc = await getTranslations("common");
  const all: Crumb[] = [{ label: tc("home"), href: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {all.map((c, i) => {
        const last = i === all.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {c.href && !last ? (
              <Link href={c.href as never} className="hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className={last ? "font-medium text-foreground" : undefined}>{c.label}</span>
            )}
            {!last && <ChevronRight className="size-3.5 rtl:rotate-180" />}
          </span>
        );
      })}
    </nav>
  );
}

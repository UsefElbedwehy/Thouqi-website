import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { buildQuery, type ListingParams } from "@/lib/search-params";

/**
 * Server-rendered, link-based pagination (crawlable, no JS). Chevrons flip for
 * RTL via `rtl:rotate-180`.
 */
export function Pagination({
  basePath,
  params,
  total,
  extra,
}: {
  basePath: string;
  params: ListingParams;
  total: number;
  extra?: Record<string, string>;
}) {
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));
  if (pageCount <= 1) return null;

  const current = Math.min(params.page, pageCount);
  const pages = pageRange(current, pageCount);

  const href = (p: number) => (basePath + buildQuery(params, { page: p }, extra)) as never;
  const itemClass =
    "flex h-9 min-w-9 items-center justify-center rounded-[--radius] border border-border px-3 text-sm hover:border-primary";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      {current > 1 && (
        <Link href={href(current - 1)} className={itemClass} aria-label="Previous page">
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(itemClass, p === current && "border-primary bg-primary text-primary-foreground")}
          >
            {p}
          </Link>
        ),
      )}
      {current < pageCount && (
        <Link href={href(current + 1)} className={itemClass} aria-label="Next page">
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Link>
      )}
    </nav>
  );
}

function pageRange(current: number, count: number): (number | "…")[] {
  const delta = 1;
  const range: (number | "…")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(count - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < count - 1) range.push("…");
  if (count > 1) range.push(count);
  return range;
}

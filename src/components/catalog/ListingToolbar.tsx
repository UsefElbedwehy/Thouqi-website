"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { PER_PAGE_OPTIONS, buildQuery, type ListingParams } from "@/lib/search-params";

/**
 * Client toolbar: item count + per-page + sort. Changing a control pushes new
 * URL params (server re-renders the grid). Kept a small interactive island;
 * the grid itself stays server-rendered.
 */
export function ListingToolbar({
  total,
  params,
  extra,
}: {
  total: number;
  params: ListingParams;
  extra?: Record<string, string>;
}) {
  const t = useTranslations("listing");
  const pathname = usePathname();
  const router = useRouter();

  function update(overrides: Partial<ListingParams>) {
    router.push((pathname + buildQuery(params, { ...overrides, page: 1 }, extra)) as never);
  }

  const selectClass =
    "rounded-[--radius] border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <p className="text-sm text-muted-foreground">{t("itemsCount", { count: total })}</p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <select
            aria-label={t("perPage")}
            className={selectClass}
            value={params.perPage}
            onChange={(e) => update({ perPage: Number(e.target.value) })}
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>{t("perPage")}</span>
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("sortBy")}</span>
          <select
            aria-label={t("sortBy")}
            className={selectClass}
            value={params.sort}
            onChange={(e) => update({ sort: e.target.value as ListingParams["sort"] })}
          >
            <option value="position">{t("position")}</option>
            <option value="newest">{t("newest")}</option>
            <option value="price_asc">{t("priceLowHigh")}</option>
            <option value="price_desc">{t("priceHighLow")}</option>
          </select>
        </label>
      </div>
    </div>
  );
}

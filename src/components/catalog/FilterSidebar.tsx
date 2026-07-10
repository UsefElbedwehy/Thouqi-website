import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import type { Brand, Category } from "@/core/catalog/types";
import { t } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { toggleBrandQuery, buildQuery, type ListingParams } from "@/lib/search-params";

/**
 * Listing filter sidebar: category navigation + brand facets. Facets are toggle
 * links (server-rendered, crawlable, JS-free) that mutate the URL query. The
 * active category and selected brands are highlighted.
 */
export async function FilterSidebar({
  activeCategory,
  siblings,
  subcategories,
  brands,
  basePath,
  params,
  locale,
}: {
  activeCategory: Category;
  siblings: Category[];
  subcategories: Category[];
  brands: Brand[];
  basePath: string;
  params: ListingParams;
  locale: string;
}) {
  const tl = await getTranslations("listing");
  // Show drill-down children if present, otherwise sibling categories.
  const categoryList = subcategories.length ? subcategories : siblings;
  const hasFilters = params.brands.length > 0;

  return (
    <aside className="w-full space-y-8 lg:w-56 lg:shrink-0">
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">{tl("categories")}</h2>
        <ul className="space-y-2 text-sm">
          {categoryList.map((c) => (
            <li key={c.id}>
              <Link
                href={`/c/${c.slug}` as never}
                className={cn(
                  "hover:text-primary",
                  c.id === activeCategory.id ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {t(c.name, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide">{tl("refineBy")}</h2>
          {hasFilters && (
            <Link href={(basePath + buildQuery(params, { brands: [], page: 1 })) as never} className="text-xs text-primary hover:underline">
              {tl("clearFilters")}
            </Link>
          )}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {tl("brand")}
        </p>
        <ul className="space-y-2 text-sm">
          {brands.map((b) => {
            const checked = params.brands.includes(b.slug);
            return (
              <li key={b.id}>
                <Link
                  href={(basePath + toggleBrandQuery(params, b.slug)) as never}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-[2px] border",
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {checked && <Check className="size-3" />}
                  </span>
                  {t(b.name, locale)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

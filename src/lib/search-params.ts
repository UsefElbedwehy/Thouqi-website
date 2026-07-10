/**
 * Helpers for the listing page's URL-driven filter/sort/pagination state.
 * Keeping this state in the URL makes filtered views shareable, SEO-friendly,
 * and back/forward correct — and lets most of the UI stay server-rendered.
 */

export interface ListingParams {
  brands: string[];
  sort: "position" | "price_asc" | "price_desc" | "newest";
  page: number;
  perPage: number;
}

export const SORT_VALUES = ["position", "price_asc", "price_desc", "newest"] as const;
export const PER_PAGE_OPTIONS = [12, 24, 48] as const;

type RawParams = Record<string, string | string[] | undefined>;

export function parseListingParams(sp: RawParams): ListingParams {
  const brandsRaw = sp.brand;
  const brands =
    typeof brandsRaw === "string"
      ? brandsRaw.split(",").filter(Boolean)
      : Array.isArray(brandsRaw)
        ? brandsRaw
        : [];

  const sortRaw = typeof sp.sort === "string" ? sp.sort : "position";
  const sort = (SORT_VALUES as readonly string[]).includes(sortRaw)
    ? (sortRaw as ListingParams["sort"])
    : "position";

  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const perPageRaw = Number.parseInt(String(sp.perPage ?? "24"), 10);
  const perPage = (PER_PAGE_OPTIONS as readonly number[]).includes(perPageRaw)
    ? perPageRaw
    : 24;

  return { brands, sort, page, perPage };
}

/**
 * Build a query string, merging overrides onto the current params. `extra`
 * carries page-specific params (e.g. the search `q`) so they survive
 * sort/pagination navigation.
 */
export function buildQuery(
  current: ListingParams,
  overrides: Partial<ListingParams>,
  extra?: Record<string, string>,
): string {
  const merged = { ...current, ...overrides };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(extra ?? {})) {
    if (v) qs.set(k, v);
  }
  if (merged.brands.length) qs.set("brand", merged.brands.join(","));
  if (merged.sort !== "position") qs.set("sort", merged.sort);
  if (merged.perPage !== 24) qs.set("perPage", String(merged.perPage));
  if (merged.page > 1) qs.set("page", String(merged.page));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** Toggle a brand slug in the current selection, resetting to page 1. */
export function toggleBrandQuery(current: ListingParams, slug: string): string {
  const brands = current.brands.includes(slug)
    ? current.brands.filter((b) => b !== slug)
    : [...current.brands, slug];
  return buildQuery(current, { brands, page: 1 });
}

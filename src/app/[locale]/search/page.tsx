import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProducts } from "@/core/catalog/service";
import { parseListingParams } from "@/lib/search-params";
import { localizedAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ListingToolbar } from "@/components/catalog/ListingToolbar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";

type Params = { locale: string };
type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tc = await getTranslations({ locale, namespace: "common" });
  return {
    title: tc("search"),
    alternates: localizedAlternates("/search", locale),
    robots: { index: false }, // search result pages shouldn't be indexed
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";
  const listing = parseListingParams(sp);
  const [tc, tl] = await Promise.all([
    getTranslations("common"),
    getTranslations("listing"),
  ]);

  const result = query
    ? await getProducts({
        search: query,
        sort: listing.sort,
        page: listing.page,
        pageSize: listing.perPage,
      })
    : { items: [], total: 0, page: 1, pageSize: listing.perPage };

  // When a search yields nothing, suggest popular/new products instead of a dead end.
  const suggestions =
    query && result.items.length === 0
      ? (await getProducts({ sort: "newest", pageSize: 8 })).items
      : [];

  const basePath = `/search`;
  const extra = query ? { q: query } : undefined;

  return (
    <Container className="py-6">
      <h1 className="mb-2 text-2xl font-bold">
        {tc("search")}
        {query && <span className="text-muted-foreground"> · “{query}”</span>}
      </h1>

      {result.items.length > 0 ? (
        <>
          <ListingToolbar total={result.total} params={listing} extra={extra} />
          <div className="mt-6">
            <ProductGrid products={result.items} locale={locale} />
          </div>
          <Pagination basePath={basePath} params={listing} total={result.total} extra={extra} />
        </>
      ) : (
        <div className="py-10">
          <p className="mb-10 text-center text-muted-foreground">{tl("noResults")}</p>
          {suggestions.length > 0 && (
            <>
              <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {tl("suggestions")}
              </h2>
              <ProductGrid products={suggestions} locale={locale} />
            </>
          )}
        </div>
      )}
    </Container>
  );
}

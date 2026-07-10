import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOnSaleProducts } from "@/core/catalog/service";
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
  const tn = await getTranslations({ locale, namespace: "nav" });
  return { title: tn("sale"), alternates: localizedAlternates("/offers", locale) };
}

export default async function OffersPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const listing = parseListingParams(await searchParams);
  const [tn, tl] = await Promise.all([getTranslations("nav"), getTranslations("listing")]);

  const result = await getOnSaleProducts({
    sort: listing.sort,
    page: listing.page,
    pageSize: listing.perPage,
  });

  return (
    <Container className="py-8">
      <h1 className="mb-2 text-center font-display text-4xl font-semibold uppercase tracking-[0.06em] text-accent">
        {tn("sale")}
      </h1>
      <p className="mb-8 text-center text-sm uppercase tracking-[0.25em] text-muted-foreground">
        {tl("itemsCount", { count: result.total })}
      </p>

      {result.items.length > 0 ? (
        <>
          <ListingToolbar total={result.total} params={listing} />
          <div className="mt-6">
            <ProductGrid products={result.items} locale={locale} />
          </div>
          <Pagination basePath="/offers" params={listing} total={result.total} />
        </>
      ) : (
        <p className="py-20 text-center text-muted-foreground">{tl("noResults")}</p>
      )}
    </Container>
  );
}

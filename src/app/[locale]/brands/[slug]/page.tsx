import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getBrands, getProducts } from "@/core/catalog/service";
import { parseListingParams } from "@/lib/search-params";
import { t } from "@/lib/format";
import { localizedAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ListingToolbar } from "@/components/catalog/ListingToolbar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";

type Params = { locale: string; slug: string };
type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const brand = (await getBrands()).find((b) => b.slug === slug);
  if (!brand) return {};
  return { title: t(brand.name, locale), alternates: localizedAlternates(`/brands/${slug}`, locale) };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const brand = (await getBrands()).find((b) => b.slug === slug);
  if (!brand) notFound();

  const listing = parseListingParams(await searchParams);
  const tl = await getTranslations("listing");
  const result = await getProducts({
    brandSlugs: [slug],
    sort: listing.sort,
    page: listing.page,
    pageSize: listing.perPage,
  });

  return (
    <Container className="py-8">
      <h1 className="mb-8 text-center font-display text-4xl font-semibold uppercase tracking-[0.06em]">
        {t(brand.name, locale)}
      </h1>
      {result.items.length > 0 ? (
        <>
          <ListingToolbar total={result.total} params={listing} />
          <div className="mt-6">
            <ProductGrid products={result.items} locale={locale} />
          </div>
          <Pagination basePath={`/brands/${slug}`} params={listing} total={result.total} />
        </>
      ) : (
        <p className="py-20 text-center text-muted-foreground">{tl("noResults")}</p>
      )}
    </Container>
  );
}

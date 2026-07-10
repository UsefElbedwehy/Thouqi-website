import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  getCategory,
  getSiblingCategories,
  getSubcategories,
  getBrands,
  getProducts,
  getCategoryTrail,
} from "@/core/catalog/service";
import { parseListingParams } from "@/lib/search-params";
import { localizedAlternates } from "@/lib/seo";
import { t } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { ListingToolbar } from "@/components/catalog/ListingToolbar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";

type Params = { locale: string; slug: string[] };
type Search = Record<string, string | string[] | undefined>;

function activeSlug(slug: string[]): string {
  return slug[slug.length - 1];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategory(activeSlug(slug));
  if (!category) return {};
  const name = t(category.name, locale);
  return {
    title: name,
    alternates: localizedAlternates(`/c/${slug.join("/")}`, locale),
    openGraph: { title: name },
  };
}

export default async function CategoryListingPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = await getCategory(activeSlug(slug));
  if (!category) notFound();

  const listing = parseListingParams(await searchParams);
  const basePath = `/c/${slug.join("/")}`;

  const [siblings, children, brands, trail, tl] = await Promise.all([
    getSiblingCategories(category),
    getSubcategories(category.id),
    getBrands(),
    getCategoryTrail(category.slug),
    getTranslations("listing"),
  ]);

  const result = await getProducts({
    categorySlug: category.slug,
    brandSlugs: listing.brands.length ? listing.brands : undefined,
    sort: listing.sort,
    page: listing.page,
    pageSize: listing.perPage,
  });

  const crumbs = trail.map((c) => ({ label: t(c.name, locale), href: `/c/${c.slug}` }));

  return (
    <Container className="py-6">
      <Breadcrumbs items={crumbs} />

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <FilterSidebar
          activeCategory={category}
          siblings={siblings}
          subcategories={children}
          brands={brands}
          basePath={basePath}
          params={listing}
          locale={locale}
        />

        <div className="min-w-0 flex-1">
          <h1 className="mb-4 text-center text-2xl font-bold uppercase tracking-[0.15em]">
            {t(category.name, locale)}
          </h1>

          <ListingToolbar total={result.total} params={listing} />

          {result.items.length > 0 ? (
            <>
              <div className="mt-6">
                <ProductGrid products={result.items} locale={locale} />
              </div>
              <Pagination basePath={basePath} params={listing} total={result.total} />
            </>
          ) : (
            <p className="py-20 text-center text-muted-foreground">{tl("noResults")}</p>
          )}
        </div>
      </div>
    </Container>
  );
}

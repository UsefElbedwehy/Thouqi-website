import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProduct, getRelatedProducts, getCategoryTrail } from "@/core/catalog/service";
import { getSiteConfig, getAssets } from "@/config";
import { t } from "@/lib/format";
import { localizedAlternates, SITE_URL } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { AddToCartPanel } from "@/components/catalog/AddToCartPanel";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Accordion } from "@/components/ui/Accordion";
import { ShareRow } from "@/components/catalog/ShareRow";
import { SectionHeading } from "@/components/home/SectionHeading";

type Params = { locale: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const name = `${t(product.brand.name, locale)} — ${t(product.name, locale)}`;
  return {
    title: name,
    description: t(product.description, locale) || name,
    alternates: localizedAlternates(`/p/${slug}`, locale),
    openGraph: {
      title: name,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProduct(slug);
  if (!product) notFound();

  const [config, related, tp] = await Promise.all([
    getSiteConfig(),
    getRelatedProducts(product),
    getTranslations("product"),
  ]);
  const assets = getAssets();

  // Breadcrumb trail via the product's primary category.
  const primaryCatId = product.categoryIds[0];
  const primaryCatSlug = primaryCatId ? await findCategorySlug(primaryCatId) : null;
  const trail = primaryCatSlug ? await getCategoryTrail(primaryCatSlug) : [];
  const crumbs = [
    ...trail.map((c) => ({ label: t(c.name, locale), href: `/c/${c.slug}` })),
    { label: t(product.name, locale) },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t(product.name, locale),
    brand: { "@type": "Brand", name: t(product.brand.name, locale) },
    image: product.images.map((i) => i.url),
    description: t(product.description, locale),
    sku: product.variants[0]?.sku ?? product.id,
    offers: {
      "@type": "Offer",
      price: (product.price / 1000).toFixed(config.commerce.currencyFractionDigits),
      priceCurrency: config.commerce.currencyCode,
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/${locale}/p/${product.slug}`,
    },
  };

  return (
    <Container className="py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={crumbs} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ProductGallery
          images={product.images}
          alt={t(product.name, locale)}
          fallback={assets.placeholders.product}
        />

        <div className="lg:ps-6">
          <h1 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            {t(product.brand.name, locale)}
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">{t(product.name, locale)}</p>

          <div className="mt-6">
            <AddToCartPanel
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand.name,
                image: product.images[0]?.url,
                price: product.price,
                variants: product.variants,
              }}
              locale={locale}
            />
          </div>

          <div className="mt-8">
            <Accordion title={tp("details")} open>
              {product.details.length ? (
                <ul className="list-disc space-y-1 ps-5">
                  {product.details.map((d, i) => (
                    <li key={i}>{t(d, locale)}</li>
                  ))}
                  <li>
                    {tp("productId")}: {product.id}
                  </li>
                </ul>
              ) : (
                <p>{t(product.description, locale)}</p>
              )}
            </Accordion>
            <Accordion title={tp("sizeAndFit")}>
              <p>{t(product.description, locale) || "—"}</p>
            </Accordion>
            <Accordion title={tp("delivery")}>
              <p>{locale === "ar" ? "شحن خلال ٢–٤ أيام عمل · إرجاع مجاني" : "Shipped in 2–4 business days · Free returns"}</p>
            </Accordion>
          </div>

          <ShareRow title={`${t(product.brand.name, locale)} — ${t(product.name, locale)}`} image={product.images[0]?.url} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={t(product.brand.name, locale)} />
          <ProductGrid products={related} locale={locale} />
        </section>
      )}
    </Container>
  );
}

/** Resolve a category slug from its id via the catalog repository. */
async function findCategorySlug(categoryId: string): Promise<string | null> {
  const { getCatalogRepository } = await import("@/data");
  const cats = await getCatalogRepository().listCategories();
  return cats.find((c) => c.id === categoryId)?.slug ?? null;
}

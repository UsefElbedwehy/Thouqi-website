import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCollection, getCollectionProducts } from "@/core/catalog/service";
import { t } from "@/lib/format";
import { localizedAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ProductGrid } from "@/components/catalog/ProductGrid";

type Params = { locale: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return {};
  return {
    title: t(collection.title, locale),
    alternates: localizedAlternates(`/collections/${slug}`, locale),
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const collection = await getCollection(slug);
  if (!collection) notFound();
  const products = await getCollectionProducts(collection.productIds);

  return (
    <div>
      {collection.bannerImage && (
        <section className="relative aspect-[21/8] w-full overflow-hidden bg-foreground">
          <Image src={collection.bannerImage} alt={t(collection.title, locale)} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-white">
            <h1 className="font-display text-4xl font-semibold uppercase tracking-[0.06em] drop-shadow sm:text-6xl">
              {t(collection.title, locale)}
            </h1>
            {collection.subtitle && (
              <p className="text-sm uppercase tracking-[0.25em] text-white/85">{t(collection.subtitle, locale)}</p>
            )}
          </div>
        </section>
      )}

      <Container className="py-12">
        {!collection.bannerImage && (
          <h1 className="mb-8 text-center font-display text-4xl font-semibold uppercase tracking-[0.06em]">
            {t(collection.title, locale)}
          </h1>
        )}
        <ProductGrid products={products} locale={locale} />
      </Container>
    </div>
  );
}
